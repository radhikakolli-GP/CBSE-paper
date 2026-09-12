// Groups a flat question/result list into consecutive runs, tagging each
// entry with whether it starts a new subject section and/or a new
// passage group (CBQ/MAP), so the UI can render section headers and shared
// passages exactly once. Section headers are only meaningful for the
// "school" pattern, where questions are laid out in contiguous per-subject
// blocks - for the flat mixed "board" pattern (questions pooled and
// shuffled across subjects within each mark-type), showSections should be
// false so we don't render a confusing header every time the subject
// happens to change between two consecutive questions.
export function annotateGrouping(items, showSections) {
  let lastLabel = null;
  let lastGroup = null;
  return items.map((item) => {
    const subjectLabel = item.subject
      ? item.subject.charAt(0).toUpperCase() + item.subject.slice(1).replace("civics", "Political Science")
      : null;
    const niceSubject = item.subject === "civics" ? "Political Science" : subjectLabel;
    // English papers carry an explicit `section` (Reading / Writing & Grammar
    // / Literature) since those don't map onto a single "subject" the way
    // Social Science/Science do - prefer it over the subject-derived label.
    const label = item.section || niceSubject;
    const startsSection = showSections && label && label !== lastLabel;
    const startsGroup = !item.group_id || item.group_id !== lastGroup;
    lastLabel = label || lastLabel;
    lastGroup = item.group_id || null;
    return { ...item, _sectionLabel: label, _startsSection: startsSection, _startsGroup: startsGroup };
  });
}

export const GROUPED_PASSAGE_TYPES = ["CBQ", "MAP", "READING", "EXTRACT", "CLOZE", "EDITING", "REPORTED"];
