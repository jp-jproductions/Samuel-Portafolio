import { ResumeData } from '../types';
import { DEFAULT_RESUME } from '../data/resumeData';

const RESUME_STORAGE_KEY = 'samuel_custom_resume';

export function loadResumeData(): ResumeData {
  if (typeof window === 'undefined') return DEFAULT_RESUME;
  try {
    const saved = localStorage.getItem(RESUME_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_RESUME,
        ...parsed,
        pillars: parsed.pillars || DEFAULT_RESUME.pillars,
        experiences: parsed.experiences || DEFAULT_RESUME.experiences,
        awards: parsed.awards || DEFAULT_RESUME.awards,
      };
    }
  } catch (err) {
    console.error('Error cargando CV:', err);
  }
  return DEFAULT_RESUME;
}

export function saveResumeData(data: ResumeData): void {
  try {
    localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error guardando CV:', err);
  }
}

export function resetResumeData(): ResumeData {
  try {
    localStorage.removeItem(RESUME_STORAGE_KEY);
  } catch {
    // ignore
  }
  return DEFAULT_RESUME;
}
