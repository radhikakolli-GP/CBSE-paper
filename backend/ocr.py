"""
OCR helper for handwritten/photographed answer sheets.
Uses pytesseract + Pillow if available; degrades gracefully (returns an
empty string with a warning) if either the Python packages or the Tesseract
binary are not installed, so the rest of the app keeps working even without
OCR set up.

Also accepts PDF uploads (a student scanning/exporting their answer as a
PDF instead of a photo is common). PDFs can't be opened by Pillow directly,
so pages are rasterised to images first, via either PyMuPDF (pip-installable,
no system dependency - preferred) or the `pdftoppm` command from
poppler-utils if that's installed on the host instead. If neither is
available, a clear, specific error is returned instead of silently failing.

Two upload paths are supported:
- `save_and_extract_text()` - one photo/PDF per question (existing,
  per-question "upload a photo of your handwritten answer" flow).
- `extract_sheet_pages()` + `split_answer_sheet()` - a whole answer sheet
  (one or more photos, or a multi-page scanned PDF) covering every
  descriptive question on a paper at once, split into per-question text by
  looking for question-number markers ("5.", "Q5", "Question 5:") that the
  student is expected to write before each answer, same as in a real exam
  answer booklet. This only ever produces a *draft* answer per question -
  the frontend always shows it back to the student to review/correct before
  grading, since handwriting OCR is not perfectly reliable.
"""
import base64
import io
import os
import re
import shutil
import subprocess
import tempfile
import uuid

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

try:
    import pytesseract
    from PIL import Image, ImageOps, ImageFilter
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False

try:
    import fitz  # PyMuPDF
    PDF_ENGINE = "pymupdf"
except ImportError:
    PDF_ENGINE = "poppler" if shutil.which("pdftoppm") else None


def ocr_status():
    if not OCR_AVAILABLE:
        return {"available": False, "reason": "pytesseract/Pillow not installed (pip install pytesseract pillow)"}
    try:
        pytesseract.get_tesseract_version()
        return {"available": True, "reason": None, "pdf_support": PDF_ENGINE}
    except Exception as e:
        return {"available": False, "reason": f"Tesseract binary not found: {e}"}


def _is_pdf(raw, mime_hint=""):
    return raw[:5] == b"%PDF-" or "pdf" in mime_hint.lower()


def _pdf_first_page_to_png_bytes(raw):
    """Rasterise page 1 of a PDF to PNG bytes. Returns (png_bytes, error)."""
    if PDF_ENGINE == "pymupdf":
        try:
            doc = fitz.open(stream=raw, filetype="pdf")
            if doc.page_count == 0:
                return None, "The uploaded PDF has no pages."
            page = doc.load_page(0)
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for sharper OCR
            return pix.tobytes("png"), None
        except Exception as e:
            return None, f"Could not read the uploaded PDF: {e}"

    if PDF_ENGINE == "poppler":
        with tempfile.TemporaryDirectory() as tmpdir:
            pdf_path = os.path.join(tmpdir, "in.pdf")
            out_prefix = os.path.join(tmpdir, "page")
            with open(pdf_path, "wb") as f:
                f.write(raw)
            try:
                subprocess.run(
                    ["pdftoppm", "-png", "-r", "200", "-f", "1", "-l", "1", pdf_path, out_prefix],
                    check=True, capture_output=True, timeout=30,
                )
            except Exception as e:
                return None, f"Could not convert the uploaded PDF to an image: {e}"
            produced = sorted(
                fn for fn in os.listdir(tmpdir) if fn.startswith("page") and fn.endswith(".png")
            )
            if not produced:
                return None, "PDF conversion produced no image (the file may be corrupted or empty)."
            with open(os.path.join(tmpdir, produced[0]), "rb") as f:
                return f.read(), None

    return None, (
        "This looks like a PDF. PDF uploads aren't supported on this server "
        "(no PDF-to-image tool installed). Please upload a photo/scan as a "
        "JPG or PNG instead, or type your answer in the box above."
    )


def _pdf_all_pages_to_png_bytes(raw, max_pages=15):
    """Rasterise up to max_pages pages of a PDF to PNG bytes. Returns (list_of_png_bytes, error)."""
    if PDF_ENGINE == "pymupdf":
        try:
            doc = fitz.open(stream=raw, filetype="pdf")
            if doc.page_count == 0:
                return [], "The uploaded PDF has no pages."
            pages = []
            for i in range(min(doc.page_count, max_pages)):
                page = doc.load_page(i)
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for sharper OCR
                pages.append(pix.tobytes("png"))
            return pages, None
        except Exception as e:
            return [], f"Could not read the uploaded PDF: {e}"

    if PDF_ENGINE == "poppler":
        with tempfile.TemporaryDirectory() as tmpdir:
            pdf_path = os.path.join(tmpdir, "in.pdf")
            out_prefix = os.path.join(tmpdir, "page")
            with open(pdf_path, "wb") as f:
                f.write(raw)
            try:
                subprocess.run(
                    ["pdftoppm", "-png", "-r", "200", "-f", "1", "-l", str(max_pages), pdf_path, out_prefix],
                    check=True, capture_output=True, timeout=60,
                )
            except Exception as e:
                return [], f"Could not convert the uploaded PDF to an image: {e}"
            produced = sorted(
                fn for fn in os.listdir(tmpdir) if fn.startswith("page") and fn.endswith(".png")
            )
            if not produced:
                return [], "PDF conversion produced no image (the file may be corrupted or empty)."
            pages = []
            for fn in produced:
                with open(os.path.join(tmpdir, fn), "rb") as f:
                    pages.append(f.read())
            return pages, None

    return [], (
        "This looks like a PDF. PDF uploads aren't supported on this server "
        "(no PDF-to-image tool installed). Please upload photos/scans as "
        "JPG or PNG instead."
    )


def _ocr_image_bytes(raw):
    """OCR raw image bytes (grayscale/contrast/sharpen preprocessing first). Returns (text, error)."""
    try:
        img = Image.open(io.BytesIO(raw)).convert("L")  # grayscale
        img = ImageOps.autocontrast(img)
        img = img.filter(ImageFilter.SHARPEN)
        text = pytesseract.image_to_string(img)
        return text.strip(), None
    except Exception as e:
        return "", f"OCR failed: {e}"


def save_and_extract_text(image_base64, filename_hint="answer"):
    """
    image_base64: raw base64 string (may include a data URL prefix like
    'data:image/png;base64,...' or 'data:application/pdf;base64,...') of a
    photographed/scanned answer, or a scanned/exported PDF.
    Returns dict: {saved_path, extracted_text, error}
    """
    mime_hint = ""
    if "," in image_base64[:60]:
        # strip data URL prefix e.g. data:image/jpeg;base64, or data:application/pdf;base64,
        header, image_base64 = image_base64.split(",", 1)
        mime_hint = header

    try:
        raw = base64.b64decode(image_base64)
    except Exception as e:
        return {"saved_path": None, "extracted_text": "", "error": f"Invalid file data: {e}"}

    is_pdf = _is_pdf(raw, mime_hint)
    fname = f"{filename_hint}_{uuid.uuid4().hex[:8]}.{'pdf' if is_pdf else 'png'}"
    fpath = os.path.join(UPLOAD_DIR, fname)
    with open(fpath, "wb") as f:
        f.write(raw)

    if not OCR_AVAILABLE:
        return {"saved_path": fpath, "extracted_text": "", "error": "OCR not available on this server; file saved but not transcribed."}

    if is_pdf:
        png_bytes, pdf_error = _pdf_first_page_to_png_bytes(raw)
        if pdf_error:
            return {"saved_path": fpath, "extracted_text": "", "error": pdf_error}
        raw = png_bytes  # continue through the normal image OCR path below

    text, err = _ocr_image_bytes(raw)
    if err:
        return {"saved_path": fpath, "extracted_text": "", "error": err}
    if not text:
        note = (
            "We converted your PDF to an image but couldn't detect any text in it "
            "(handwriting may be too faint, or the scan quality is low)."
            if is_pdf else
            "We couldn't detect any text in the uploaded image (it may be too blurry, "
            "faint, or low-resolution)."
        )
        return {"saved_path": fpath, "extracted_text": "", "error": note}
    return {"saved_path": fpath, "extracted_text": text, "error": None}


def extract_sheet_pages(uploads, filename_hint="sheet"):
    """
    uploads: list of {"data": base64 string (optionally with a data: URL
    prefix), "name": optional str} - each upload may be a single photographed
    page or a (possibly multi-page) scanned/exported PDF covering several
    pages of a handwritten answer sheet. Every rasterised page is saved to
    UPLOAD_DIR and OCR'd individually, in upload order.

    Returns {
      "pages": [{"source_name", "page_number" (1-based within its source
                 file), "text", "error", "saved_path"}, ...],
      "combined_text": str,   # every page's text, joined in upload order
      "fatal_error": str|None,  # set only when OCR isn't available at all
    }
    """
    if not OCR_AVAILABLE:
        return {
            "pages": [], "combined_text": "",
            "fatal_error": "OCR isn't available on this server (pip install pytesseract pillow "
                           "and install the Tesseract binary). Please type your answers instead, "
                           "or upload a photo per question in the boxes below.",
        }

    pages_out = []
    for upload_idx, upload in enumerate(uploads):
        data = upload.get("data", "") or ""
        name = upload.get("name") or f"page{upload_idx + 1}"
        mime_hint = ""
        if "," in data[:60]:
            header, data = data.split(",", 1)
            mime_hint = header

        try:
            raw = base64.b64decode(data)
        except Exception as e:
            pages_out.append({"source_name": name, "page_number": 1, "text": "", "error": f"Invalid file data: {e}", "saved_path": None})
            continue

        is_pdf = _is_pdf(raw, mime_hint)
        if is_pdf:
            png_pages, pdf_error = _pdf_all_pages_to_png_bytes(raw)
            if pdf_error:
                pages_out.append({"source_name": name, "page_number": 1, "text": "", "error": pdf_error, "saved_path": None})
                continue
            for p_idx, png_bytes in enumerate(png_pages):
                fname = f"{filename_hint}_{uuid.uuid4().hex[:8]}_p{p_idx + 1}.png"
                fpath = os.path.join(UPLOAD_DIR, fname)
                with open(fpath, "wb") as f:
                    f.write(png_bytes)
                text, err = _ocr_image_bytes(png_bytes)
                pages_out.append({
                    "source_name": name, "page_number": p_idx + 1, "text": text,
                    "error": err or (None if text else "No text detected on this page."),
                    "saved_path": fpath,
                })
        else:
            fname = f"{filename_hint}_{uuid.uuid4().hex[:8]}.png"
            fpath = os.path.join(UPLOAD_DIR, fname)
            with open(fpath, "wb") as f:
                f.write(raw)
            text, err = _ocr_image_bytes(raw)
            pages_out.append({
                "source_name": name, "page_number": 1, "text": text,
                "error": err or (None if text else "No text detected in this image."),
                "saved_path": fpath,
            })

    combined_text = "\n\n".join(p["text"] for p in pages_out if p["text"])
    return {"pages": pages_out, "combined_text": combined_text, "fatal_error": None}


# Matches a question-number marker at the start of a line, e.g. "5.",
# "Q5.", "Question 5:", "5)", "5 (a)" (the optional sub-part letter, common
# on CBQ/case-based sub-questions, is recognised but not used for matching -
# every sub-question already gets its own unique display number on the
# paper, e.g. "Q5 (a)", "Q6 (b)", so the leading number alone is enough to
# identify which question a segment belongs to).
_MARKER_RE = re.compile(
    r"(?im)^[ \t]*(?:Q(?:uestion)?[ \t]*\.?[ \t]*)?(\d{1,3})[ \t]*(?:\([a-eA-E]\))?[ \t]*[\.\):-]?[ \t]+"
)


def split_answer_sheet(full_text, expected):
    """
    full_text: the combined OCR transcript of an uploaded answer sheet.
    expected: ordered list of {"question_id", "number"} - "number" is the
      question's 1-based display number on the paper (matching the "Q<n>"
      label shown to the student), for every question that needs a written
      (non-MCQ/AR) answer.

    Splits the transcript at recognised question-number markers, keeping
    only markers whose number actually appears in `expected` (so a stray
    number inside the handwritten answer text itself - "in 1857...", "5 km"
    - doesn't get mistaken for a new question). This is a best-effort split:
    the frontend always shows the result back to the student to review and
    correct before grading, since handwriting OCR is never perfectly
    reliable.

    Returns {"segments": {question_id: text}, "matched_ids": [...],
             "unmatched_ids": [...], "unrecognised_markers": [n, ...]}
    """
    expected_map = {e["number"]: e["question_id"] for e in expected}

    candidates = []
    for m in _MARKER_RE.finditer(full_text):
        candidates.append({"num": int(m.group(1)), "marker_start": m.start(), "content_start": m.end()})

    valid = [c for c in candidates if c["num"] in expected_map]
    valid.sort(key=lambda c: c["marker_start"])

    # De-duplicate repeated markers for the same number (keep the first).
    seen = set()
    deduped = []
    for c in valid:
        if c["num"] in seen:
            continue
        seen.add(c["num"])
        deduped.append(c)

    segments = {}
    for i, c in enumerate(deduped):
        end = deduped[i + 1]["marker_start"] if i + 1 < len(deduped) else len(full_text)
        text = full_text[c["content_start"]:end].strip()
        if text:
            segments[expected_map[c["num"]]] = text

    matched_ids = [e["question_id"] for e in expected if e["question_id"] in segments]
    unmatched_ids = [e["question_id"] for e in expected if e["question_id"] not in segments]

    recognised_nums = {c["num"] for c in deduped}
    all_marker_nums = {c["num"] for c in candidates}
    unrecognised_markers = sorted(all_marker_nums - recognised_nums)

    return {
        "segments": segments,
        "matched_ids": matched_ids,
        "unmatched_ids": unmatched_ids,
        "unrecognised_markers": unrecognised_markers,
    }
