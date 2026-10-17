export interface ProjectMedia {
  id: string;
  type: 'image' | 'video' | 'pdf';
  url: string;
  name?: string;
  caption?: string;
  size?: string;
  videoFormat?: 'reels' | 'tiktok' | 'historia' | 'horizontal' | 'cuadrado' | string;
  date?: string; // e.g. '2026-1', '2026-2', '2025-1', '2025-2', '2024-1', '2024-2'
}

export interface ProjectDocument {
  id: string;
  name: string;
  url: string;
  size?: string;
  date?: string;
}

export interface Project {
  id: string;
  title: string;
  year: string;
  tags: string[];
  image: string;
  videoUrl?: string;
  videoFormat?: 'reels' | 'tiktok' | 'historia' | 'horizontal' | 'cuadrado' | string;
  mediaType?: 'image' | 'video';
  gallery?: ProjectMedia[];
  span?: 'col-span-1 md:col-span-7' | 'col-span-1 md:col-span-5';
  subtitle?: string;
  category?: string;
  description?: string;
  client?: string;
  role?: string;
  deliverables?: string[];
  metrics?: string;
  url?: string;
  documents?: ProjectDocument[];
}

export interface JournalEntry {
  id: string;
  title: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  excerpt: string;
  content: string[];
}

export interface Exploration {
  id: string;
  title: string;
  medium: string;
  year: string;
  image: string;
  rotation: string;
  description: string;
  category?: string;
}

export interface VisualLabConfig {
  eyebrow: string;
  titleMain: string;
  titleItalic: string;
  description: string;
  buttonText: string;
  instagramUrl?: string;
}

export interface HeroConfig {
  eyebrow: string;
  name: string;
  rolesPrefix: string;
  roles: string[];
  rolesSuffix: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  videoUrl?: string;
}

export interface StatItem {
  number: string;
  label: string;
  description: string;
}

export interface ResumePillar {
  title: string;
  subtitle: string;
}

export interface ResumeExperience {
  id: string;
  role: string;
  period: string;
  company: string;
  description: string;
}

export interface ResumeAward {
  id: string;
  title: string;
  year: string;
}

export interface ResumeData {
  name: string;
  headline: string;
  bio: string;
  email: string;
  location: string;
  university: string;
  universityLocation: string;
  degreeDescription: string;
  customPdfUrl?: string;
  customPdfName?: string;
  pillars: ResumePillar[];
  experiences: ResumeExperience[];
  awards: ResumeAward[];
}
