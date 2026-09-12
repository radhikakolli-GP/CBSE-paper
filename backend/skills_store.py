"""
Loads standalone "skill practice" content from the JSON files in skills/.

This is deliberately separate from content_store.py: chapter content there
follows the CBSE exam-paper schema (MCQ/AR/2M/3M/5M/CBQ question types,
rubric-based descriptive grading, typology auditing, tied to a subject and
chapter). Skill-practice content is a different shape entirely - a flat bank
of short drill problems (equation + exact numeric answer + step-by-step
solution), organised into difficulty levels rather than chapters, meant for
open-ended repeated practice rather than a scored/saved exam attempt. Answers
are sent to the frontend as-is (not stripped) since this is self-practice
with instant client-side grading and an explicit "show solution" feature,
not a graded submission.

Adding a new skill is just a matter of dropping a new JSON file in skills/
with the same top-level shape (skill/title/levels[].problems[]) - no code
changes needed, same philosophy as content_store.py's chapter files.
"""
import json
import os

SKILLS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "skills")

_cache = None


def _load():
    global _cache
    if _cache is not None:
        return _cache
    skills = {}
    if os.path.isdir(SKILLS_DIR):
        for fname in os.listdir(SKILLS_DIR):
            if not fname.endswith(".json"):
                continue
            with open(os.path.join(SKILLS_DIR, fname), encoding="utf-8") as f:
                data = json.load(f)
            skills[data["skill"]] = data
    _cache = skills
    return _cache


def list_skills():
    skills = _load()
    return [{"skill": s["skill"], "title": s["title"]} for s in skills.values()]


def get_skill(skill_id):
    skills = _load()
    return skills.get(skill_id)
