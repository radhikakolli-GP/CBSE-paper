export function pillClass(type) {
  switch (type) {
    case "MCQ": return "pill mcq";
    case "AR": return "pill ar";
    case "2M": return "pill m2";
    case "3M": return "pill m3";
    case "4M": return "pill m4";
    case "5M": return "pill m5";
    case "CBQ": return "pill cbq";
    case "MAP": return "pill map";
    case "READING": return "pill cbq";
    case "EXTRACT": return "pill cbq";
    case "CLOZE": return "pill ar";
    case "EDITING": return "pill ar";
    case "REPORTED": return "pill ar";
    case "JUMBLED": return "pill ar";
    case "APPLICATION": return "pill m3";
    case "DESCRIPTION": return "pill m4";
    case "LETTER": return "pill m5";
    case "ARTICLE": return "pill m5";
    case "COMPARE": return "pill m5";
    default: return "pill mcq";
  }
}
export function pillLabel(q) {
  switch (q.group_type || q.type) {
    case "MCQ": return "MCQ - 1 mark";
    case "AR": return "Assertion-Reason - 1 mark";
    case "CBQ": return "Case-based - " + q.marks + " mark" + (q.marks === 1 ? "" : "s");
    case "MAP": return "Map-based - 1 mark";
    case "READING": return "Reading comprehension";
    case "EXTRACT": return "Literature extract";
    case "CLOZE": return "Grammar (gap-fill) - 1 mark";
    case "EDITING": return "Grammar (editing/omission) - 1 mark";
    case "REPORTED": return "Grammar (reported speech)";
    case "JUMBLED": return "Grammar (jumbled sentence) - " + q.marks + " mark";
    case "APPLICATION": return "Application writing - " + q.marks + " marks";
    case "DESCRIPTION": return "Factual description - " + q.marks + " marks";
    case "LETTER": return "Letter to the editor - " + q.marks + " marks";
    case "ARTICLE": return "Article/Speech/Story - " + q.marks + " marks";
    case "COMPARE": return "Comparative essay - " + q.marks + " marks";
    default: return q.type + " - " + q.marks + " marks";
  }
}
export function wordLimitHint(type) {
  switch (type) {
    case "2M": return "max ~40 words, 30-40 words recommended";
    case "3M": return "max ~60 words";
    case "4M": return "max ~120 words";
    case "5M": return "max ~120 words";
    case "CBQ": return "short answer";
    case "MAP": return "name only";
    case "READING": return "short/precise answer";
    case "EXTRACT": return "short/precise answer";
    case "EDITING": return "state the missing word";
    case "REPORTED": return "complete the sentence";
    case "JUMBLED": return "rearrange into one sentence";
    case "APPLICATION": return "not more than 50 words, correct format";
    case "DESCRIPTION": return "not more than 100 words";
    case "LETTER": return "about 120 words, correct format";
    case "ARTICLE": return "about 150 words, use the given cues";
    case "COMPARE": return "about 150 words, cover both texts";
    default: return null;
  }
}
export function isChoiceType(type) {
  return type === "MCQ" || type === "AR";
}

export const SUBJECT_ORDER = ["History", "Geography", "Political Science", "Economics"];

export const COURSES = [
  { key: "social_science", label: "Social Science" },
  { key: "science", label: "Science" },
  { key: "mathematics", label: "Mathematics" },
  { key: "english", label: "English" },
];

export const PATTERN_LABELS = { board: "Fixed board pattern", custom: "Custom", school: "School pattern", english: "English board pattern" };
