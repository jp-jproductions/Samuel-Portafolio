import { Project, ProjectMedia, ProjectDocument, ResumeData, Exploration, VisualLabConfig, HeroConfig } from '../types';
import {
  PROJECTS as DEFAULT_PROJECTS,
  DEFAULT_RESUME,
  EXPLORATIONS as DEFAULT_EXPLORATIONS,
  DEFAULT_VISUAL_LAB_CONFIG,
  DEFAULT_HERO_CONFIG,
  HLS_VIDEO_URL,
} from '../data/portfolioData';

const DB_NAME = 'SamuelPortfolioDB';
const DB_VERSION = 3; // Version 3 with dual server & IndexedDB persistence
const STORE_MEDIA = 'media_files';
const STORE_CONFIG = 'project_config';

// Bi-directional in-memory tracking of active Object URLs and their Media IDs
const mediaIdToBlobUrl = new Map<string, string>();
const blobUrlToMediaId = new Map<string, string>();

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no soportado'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_MEDIA)) {
        db.createObjectStore(STORE_MEDIA, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_CONFIG)) {
        db.createObjectStore(STORE_CONFIG, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export interface StoredMediaFile {
  id: string;
  type: 'image' | 'video' | 'pdf';
  name: string;
  blob: Blob;
  size: string;
  createdAt: number;
}

// Helper to save a Blob to IndexedDB
async function saveBlobToIndexedDB(
  file: Blob,
  fileName: string,
  id: string,
  type: 'image' | 'video' | 'pdf' = 'image'
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_MEDIA, 'readwrite');
    const store = tx.objectStore(STORE_MEDIA);
    const record: StoredMediaFile = {
      id,
      type,
      name: fileName,
      blob: file,
      size: formatBytes(file.size),
      createdAt: Date.now(),
    };
    await new Promise<void>((resolve, reject) => {
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not cache file in IndexedDB:', err);
  }
}

// Save binary file (Image, MOV/MP4 Video, or PDF Document) into persistent storage
export async function storeMediaFile(
  file: File
): Promise<{ id: string; url: string; type: 'image' | 'video' | 'pdf'; name: string; size: string }> {
  const fileName = file.name.toLowerCase();
  let type: 'image' | 'video' | 'pdf' = 'image';

  if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
    type = 'pdf';
  } else if (
    file.type.startsWith('video/') ||
    file.type === 'video/quicktime' ||
    fileName.endsWith('.mov') ||
    fileName.endsWith('.mp4') ||
    fileName.endsWith('.webm') ||
    fileName.endsWith('.m4v')
  ) {
    type = 'video';
  } else {
    type = 'image';
  }

  // 1. Try uploading to server endpoint /api/upload for permanent static file in /public/uploads/
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.url) {
        // Also cache in IndexedDB for offline resilience
        const mediaId = data.fileName || `media_${Date.now()}`;
        await saveBlobToIndexedDB(file, file.name, mediaId, type);

        return {
          id: mediaId,
          url: data.url, // Permanent static URL e.g. /uploads/1729188000-mivideo.mov
          type,
          name: file.name,
          size: data.size || formatBytes(file.size),
        };
      }
    }
  } catch (err) {
    console.warn('Server upload not reachable, continuing with IndexedDB:', err);
  }

  // 2. Client-side IndexedDB persistent fallback
  const id = `media_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const size = formatBytes(file.size);

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_MEDIA, 'readwrite');
    const store = tx.objectStore(STORE_MEDIA);

    // Create a pristine slice/blob to avoid WebKit File clone quirks
    const cleanBlob = file.slice(0, file.size, file.type);

    const record: StoredMediaFile = {
      id,
      type,
      name: file.name,
      blob: cleanBlob,
      size,
      createdAt: Date.now(),
    };

    await new Promise<void>((resolve, reject) => {
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    const url = URL.createObjectURL(cleanBlob);
    mediaIdToBlobUrl.set(id, url);
    blobUrlToMediaId.set(url, id);

    return { id, url, type, name: file.name, size };
  } catch (err) {
    console.warn('Fallback to direct object URL:', err);
    const url = URL.createObjectURL(file);
    blobUrlToMediaId.set(url, id);
    return { id, url, type, name: file.name, size };
  }
}

// Retrieve single media file by ID
export async function getMediaFile(id: string): Promise<StoredMediaFile | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_MEDIA, 'readonly');
    const store = tx.objectStore(STORE_MEDIA);
    return new Promise((resolve) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// Helper: Normalize an active URL to persistent format before saving
function toPersistentUrl(url?: string): string | undefined {
  if (!url) return url;
  // If it's already a server upload, external URL, or data URI, keep as is
  if (url.startsWith('/uploads/') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  // If it's an idb reference, keep as is
  if (url.startsWith('idb:')) {
    return url;
  }
  // If it's a blob: URL, look up its mapped media ID
  if (url.startsWith('blob:')) {
    if (blobUrlToMediaId.has(url)) {
      return `idb:${blobUrlToMediaId.get(url)!}`;
    }
  }
  return url;
}

// Helper: Hydrate a persistent URL back to an active playable/renderable URL
function toActiveUrl(url: string | undefined, mediaMap: Map<string, string>, fallbackList: StoredMediaFile[]): string {
  if (!url) return '';
  if (url.startsWith('/uploads/') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('idb:')) {
    const mediaId = url.replace('idb:', '');
    if (mediaMap.has(mediaId)) {
      return mediaMap.get(mediaId)!;
    }
  }
  // If an old expired blob: URL was saved in a previous turn, attempt rescue from stored media
  if (url.startsWith('blob:')) {
    if (blobUrlToMediaId.has(url)) {
      const mediaId = blobUrlToMediaId.get(url)!;
      if (mediaMap.has(mediaId)) {
        return mediaMap.get(mediaId)!;
      }
    }
    // Attempt rescue with the most recent matching media
    if (fallbackList.length > 0) {
      const last = fallbackList[fallbackList.length - 1];
      if (mediaMap.has(last.id)) {
        return mediaMap.get(last.id)!;
      }
    }
  }
  return url;
}

// Retrieve custom projects list (from server or IndexedDB)
export async function loadProjects(): Promise<Project[]> {
  try {
    // 1. First check if server has saved custom projects
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.projects) && data.projects.length > 0) {
          // Hydrate any idb: references
          return await hydrateProjectsList(data.projects);
        }
      }
    } catch {
      // Server not reachable, continue to IndexedDB
    }

    // 2. Read from IndexedDB
    const db = await openDB();
    const tx = db.transaction([STORE_CONFIG, STORE_MEDIA], 'readonly');
    const configStore = tx.objectStore(STORE_CONFIG);

    const configRecord: { key: string; projects: Project[] } | undefined = await new Promise((resolve) => {
      const req = configStore.get('projects_list');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(undefined);
    });

    if (configRecord && configRecord.projects && configRecord.projects.length > 0) {
      return await hydrateProjectsList(configRecord.projects);
    }

    const local = localStorage.getItem('samuel_custom_projects');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return await hydrateProjectsList(parsed);
        }
      } catch {
        // ignore
      }
    }

    return DEFAULT_PROJECTS;
  } catch (err) {
    console.warn('Error loading projects, returning default:', err);
    return DEFAULT_PROJECTS;
  }
}

// Hydrate stored project media URLs with active Blob URLs
async function hydrateProjectsList(rawProjects: Project[]): Promise<Project[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_MEDIA, 'readonly');
    const mediaStore = tx.objectStore(STORE_MEDIA);

    const allStoredMedia: StoredMediaFile[] = await new Promise((resolve) => {
      const req = mediaStore.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    const mediaMap = new Map<string, string>();
    allStoredMedia.forEach((item) => {
      try {
        let objectUrl = mediaIdToBlobUrl.get(item.id);
        if (!objectUrl) {
          objectUrl = URL.createObjectURL(item.blob);
          mediaIdToBlobUrl.set(item.id, objectUrl);
          blobUrlToMediaId.set(objectUrl, item.id);
        }
        mediaMap.set(item.id, objectUrl);
      } catch {
        // Ignored
      }
    });

    return rawProjects.map((proj) => {
      const image = toActiveUrl(proj.image, mediaMap, allStoredMedia);
      const videoUrl = proj.videoUrl ? toActiveUrl(proj.videoUrl, mediaMap, allStoredMedia) : undefined;

      const resolvedCoverUrl = videoUrl || image || proj.videoUrl || proj.image;

      const gallery: ProjectMedia[] = (proj.gallery || [])
        .map((item) => {
          let activeUrl = item.url;
          if (item.url && item.url.startsWith('idb:')) {
            activeUrl = toActiveUrl(item.url, mediaMap, allStoredMedia);
          } else if (item.id && mediaMap.has(item.id)) {
            activeUrl = mediaMap.get(item.id)!;
          } else if (item.url && item.url.startsWith('blob:')) {
            activeUrl = toActiveUrl(item.url, mediaMap, allStoredMedia);
          }
          return {
            ...item,
            url: activeUrl,
          };
        })
        .filter((item) => {
          // Strictly exclude the cover from the project's material/gallery
          const isCover =
            (videoUrl && item.url === videoUrl) ||
            (image && item.url === image) ||
            (proj.videoUrl && item.url === proj.videoUrl) ||
            (proj.image && item.url === proj.image);
          return !isCover;
        });

      const documents: ProjectDocument[] = (proj.documents || []).map((doc) => {
        let activeUrl = doc.url;
        if (doc.url && doc.url.startsWith('idb:')) {
          activeUrl = toActiveUrl(doc.url, mediaMap, allStoredMedia);
        } else if (doc.id && mediaMap.has(doc.id)) {
          activeUrl = mediaMap.get(doc.id)!;
        }
        return {
          ...doc,
          url: activeUrl,
        };
      });

      return {
        ...proj,
        image: image || proj.image,
        videoUrl,
        gallery,
        documents,
      };
    });
  } catch {
    return rawProjects;
  }
}

// Save modified projects to both server and IndexedDB
export async function saveProjects(projects: Project[]): Promise<void> {
  // Normalize all URLs so blob: pointers become persistent idb: or /uploads/ paths
  const persistentProjects: Project[] = projects.map((proj) => {
    const persistentImage = toPersistentUrl(proj.image) || proj.image;
    const persistentVideo = proj.videoUrl ? toPersistentUrl(proj.videoUrl) : undefined;

    const gallery: ProjectMedia[] = (proj.gallery || [])
      .map((item) => {
        let persistentItemUrl = toPersistentUrl(item.url) || item.url;
        if (item.id && !persistentItemUrl.startsWith('/uploads/') && !persistentItemUrl.startsWith('http')) {
          persistentItemUrl = `idb:${item.id}`;
        }
        return {
          ...item,
          url: persistentItemUrl,
        };
      })
      .filter((item) => {
        // Guarantee cover is never duplicated into the project's material/gallery
        const isCover =
          (persistentVideo && item.url === persistentVideo) ||
          (persistentImage && item.url === persistentImage) ||
          (proj.videoUrl && item.url === proj.videoUrl) ||
          (proj.image && item.url === proj.image);
        return !isCover;
      });

    const documents: ProjectDocument[] = (proj.documents || []).map((doc) => {
      let persistentDocUrl = toPersistentUrl(doc.url) || doc.url;
      if (doc.id && !persistentDocUrl.startsWith('/uploads/') && !persistentDocUrl.startsWith('http')) {
        persistentDocUrl = `idb:${doc.id}`;
      }
      return {
        ...doc,
        url: persistentDocUrl,
      };
    });

    return {
      ...proj,
      image: persistentImage,
      videoUrl: persistentVideo,
      gallery,
      documents,
    };
  });

  // 1. Try sending to server /api/projects for permanent storage
  try {
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projects: persistentProjects }),
    });
  } catch (err) {
    console.warn('Could not save projects to server endpoint:', err);
  }

  // 2. Save to IndexedDB
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_CONFIG, 'readwrite');
    const configStore = tx.objectStore(STORE_CONFIG);

    await new Promise<void>((resolve, reject) => {
      const req = configStore.put({ key: 'projects_list', projects: persistentProjects, updatedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    try {
      localStorage.setItem('samuel_custom_projects', JSON.stringify(persistentProjects));
    } catch {
      // quota safeguard
    }
  } catch (err) {
    console.error('Error saving projects to IndexedDB:', err);
    try {
      localStorage.setItem('samuel_custom_projects', JSON.stringify(persistentProjects));
    } catch {
      // ignore
    }
  }
}

// Reset to original default projects
export async function resetProjects(): Promise<Project[]> {
  try {
    const db = await openDB();
    const tx = db.transaction([STORE_CONFIG, STORE_MEDIA], 'readwrite');
    tx.objectStore(STORE_CONFIG).delete('projects_list');
  } catch {
    // ignore
  }
  try {
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projects: DEFAULT_PROJECTS }),
    });
  } catch {
    // ignore
  }
  localStorage.removeItem('samuel_custom_projects');
  return DEFAULT_PROJECTS;
}

// Load custom CV / Resume data with persistence
export async function loadResume(): Promise<ResumeData> {
  try {
    const db = await openDB();
    const tx = db.transaction([STORE_CONFIG, STORE_MEDIA], 'readonly');
    const configStore = tx.objectStore(STORE_CONFIG);
    const mediaStore = tx.objectStore(STORE_MEDIA);

    const configRecord: { key: string; resume: ResumeData } | undefined = await new Promise((resolve) => {
      const req = configStore.get('resume_data');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(undefined);
    });

    if (!configRecord || !configRecord.resume) {
      const local = localStorage.getItem('samuel_custom_resume');
      if (local) {
        try {
          return JSON.parse(local);
        } catch {
          return DEFAULT_RESUME;
        }
      }
      return DEFAULT_RESUME;
    }

    let resume = configRecord.resume;

    // If customPdfUrl is stored as idb:, hydrate it
    if (resume.customPdfUrl && resume.customPdfUrl.startsWith('idb:')) {
      const mediaId = resume.customPdfUrl.replace('idb:', '');
      const storedItem: StoredMediaFile | undefined = await new Promise((resolve) => {
        const req = mediaStore.get(mediaId);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(undefined);
      });
      if (storedItem) {
        try {
          const url = URL.createObjectURL(storedItem.blob);
          resume = { ...resume, customPdfUrl: url };
        } catch {
          // ignore
        }
      }
    }

    return resume;
  } catch {
    const local = localStorage.getItem('samuel_custom_resume');
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return DEFAULT_RESUME;
      }
    }
    return DEFAULT_RESUME;
  }
}

// Save modified CV / Resume data
export async function saveResume(resume: ResumeData): Promise<void> {
  const persistentResume: ResumeData = {
    ...resume,
    customPdfUrl: toPersistentUrl(resume.customPdfUrl),
  };

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_CONFIG, 'readwrite');
    const configStore = tx.objectStore(STORE_CONFIG);

    await new Promise<void>((resolve, reject) => {
      const req = configStore.put({ key: 'resume_data', resume: persistentResume, updatedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    try {
      localStorage.setItem('samuel_custom_resume', JSON.stringify(persistentResume));
    } catch {
      // quota safeguard
    }
  } catch (err) {
    console.error('Error saving resume:', err);
    try {
      localStorage.setItem('samuel_custom_resume', JSON.stringify(persistentResume));
    } catch {
      // ignore
    }
  }
}

// Reset CV / Resume to original default
export async function resetResume(): Promise<ResumeData> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_CONFIG, 'readwrite');
    tx.objectStore(STORE_CONFIG).delete('resume_data');
  } catch {
    // ignore
  }
  localStorage.removeItem('samuel_custom_resume');
  return DEFAULT_RESUME;
}

// Load Explorations for Visual Laboratory with persistence
export async function loadExplorations(): Promise<Exploration[]> {
  try {
    // Try server first
    try {
      const res = await fetch('/api/explorations');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.explorations) && data.explorations.length > 0) {
          return await hydrateExplorationsList(data.explorations);
        }
      }
    } catch {
      // Continue to IndexedDB
    }

    const db = await openDB();
    const tx = db.transaction([STORE_CONFIG, STORE_MEDIA], 'readonly');
    const configStore = tx.objectStore(STORE_CONFIG);

    const configRecord: { key: string; explorations: Exploration[] } | undefined = await new Promise((resolve) => {
      const req = configStore.get('explorations_data');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(undefined);
    });

    let explorations = configRecord?.explorations;
    if (!explorations || explorations.length === 0) {
      const local = localStorage.getItem('samuel_explorations_data');
      if (local) {
        try {
          explorations = JSON.parse(local);
        } catch {
          explorations = DEFAULT_EXPLORATIONS;
        }
      } else {
        explorations = DEFAULT_EXPLORATIONS;
      }
    }

    return await hydrateExplorationsList(explorations && explorations.length > 0 ? explorations : DEFAULT_EXPLORATIONS);
  } catch {
    return DEFAULT_EXPLORATIONS;
  }
}

async function hydrateExplorationsList(raw: Exploration[]): Promise<Exploration[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_MEDIA, 'readonly');
    const mediaStore = tx.objectStore(STORE_MEDIA);

    const allStoredMedia: StoredMediaFile[] = await new Promise((resolve) => {
      const req = mediaStore.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    const mediaMap = new Map<string, string>();
    allStoredMedia.forEach((item) => {
      let objectUrl = mediaIdToBlobUrl.get(item.id);
      if (!objectUrl) {
        objectUrl = URL.createObjectURL(item.blob);
        mediaIdToBlobUrl.set(item.id, objectUrl);
        blobUrlToMediaId.set(objectUrl, item.id);
      }
      mediaMap.set(item.id, objectUrl);
    });

    return raw.map((item) => {
      const activeImage = toActiveUrl(item.image, mediaMap, allStoredMedia);
      return {
        ...item,
        image: activeImage || item.image,
      };
    });
  } catch {
    return raw;
  }
}

// Save Explorations to storage
export async function saveExplorations(explorations: Exploration[]): Promise<void> {
  const persistentExplorations = explorations.map((item) => ({
    ...item,
    image: toPersistentUrl(item.image) || item.image,
  }));

  try {
    await fetch('/api/explorations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ explorations: persistentExplorations }),
    });
  } catch {
    // ignore
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_CONFIG, 'readwrite');
    const configStore = tx.objectStore(STORE_CONFIG);

    await new Promise<void>((resolve, reject) => {
      const req = configStore.put({ key: 'explorations_data', explorations: persistentExplorations, updatedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    try {
      localStorage.setItem('samuel_explorations_data', JSON.stringify(persistentExplorations));
    } catch {
      // ignore quota
    }
  } catch (err) {
    console.error('Error saving explorations:', err);
    try {
      localStorage.setItem('samuel_explorations_data', JSON.stringify(persistentExplorations));
    } catch {
      // ignore
    }
  }
}

// Reset Explorations to default
export async function resetExplorations(): Promise<Exploration[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_CONFIG, 'readwrite');
    tx.objectStore(STORE_CONFIG).delete('explorations_data');
  } catch {
    // ignore
  }
  try {
    await fetch('/api/explorations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ explorations: DEFAULT_EXPLORATIONS }),
    });
  } catch {
    // ignore
  }
  localStorage.removeItem('samuel_explorations_data');
  return DEFAULT_EXPLORATIONS;
}

// Load Visual Laboratory Section configuration
export async function loadVisualLabConfig(): Promise<VisualLabConfig> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_CONFIG, 'readonly');
    const configStore = tx.objectStore(STORE_CONFIG);

    const record: { key: string; config: VisualLabConfig } | undefined = await new Promise((resolve) => {
      const req = configStore.get('visual_lab_config');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(undefined);
    });

    if (record?.config) {
      return { ...DEFAULT_VISUAL_LAB_CONFIG, ...record.config };
    }

    const local = localStorage.getItem('samuel_visual_lab_config');
    if (local) {
      try {
        return { ...DEFAULT_VISUAL_LAB_CONFIG, ...JSON.parse(local) };
      } catch {
        return DEFAULT_VISUAL_LAB_CONFIG;
      }
    }
    return DEFAULT_VISUAL_LAB_CONFIG;
  } catch {
    const local = localStorage.getItem('samuel_visual_lab_config');
    if (local) {
      try {
        return { ...DEFAULT_VISUAL_LAB_CONFIG, ...JSON.parse(local) };
      } catch {
        return DEFAULT_VISUAL_LAB_CONFIG;
      }
    }
    return DEFAULT_VISUAL_LAB_CONFIG;
  }
}

// Save Visual Laboratory Section configuration
export async function saveVisualLabConfig(config: VisualLabConfig): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_CONFIG, 'readwrite');
    const configStore = tx.objectStore(STORE_CONFIG);

    await new Promise<void>((resolve, reject) => {
      const req = configStore.put({ key: 'visual_lab_config', config, updatedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    try {
      localStorage.setItem('samuel_visual_lab_config', JSON.stringify(config));
    } catch {
      // ignore
    }
  } catch (err) {
    console.error('Error saving visual lab config:', err);
    try {
      localStorage.setItem('samuel_visual_lab_config', JSON.stringify(config));
    } catch {
      // ignore
    }
  }
}

// Reset Visual Laboratory Section configuration
export async function resetVisualLabConfig(): Promise<VisualLabConfig> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_CONFIG, 'readwrite');
    tx.objectStore(STORE_CONFIG).delete('visual_lab_config');
  } catch {
    // ignore
  }
  localStorage.removeItem('samuel_visual_lab_config');
  return DEFAULT_VISUAL_LAB_CONFIG;
}

// Load Hero Background Video URL
export async function loadHeroVideoUrl(): Promise<string> {
  try {
    // Try server first
    try {
      const res = await fetch('/api/hero-video');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.videoUrl) {
          if (data.videoUrl.startsWith('idb:')) {
            const mediaId = data.videoUrl.replace('idb:', '');
            const file = await getMediaFile(mediaId);
            if (file) {
              return URL.createObjectURL(file.blob);
            }
          }
          return data.videoUrl;
        }
      }
    } catch {
      // Continue to IndexedDB
    }

    const db = await openDB();
    const tx = db.transaction(STORE_CONFIG, 'readonly');
    const configStore = tx.objectStore(STORE_CONFIG);

    const record: { key: string; videoUrl: string } | undefined = await new Promise((resolve) => {
      const req = configStore.get('hero_video_url');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(undefined);
    });

    if (record?.videoUrl) {
      if (record.videoUrl.startsWith('idb:')) {
        const mediaId = record.videoUrl.replace('idb:', '');
        const file = await getMediaFile(mediaId);
        if (file) {
          return URL.createObjectURL(file.blob);
        }
      }
      return record.videoUrl;
    }

    const local = localStorage.getItem('samuel_hero_video_url');
    if (local) {
      return local;
    }
    return HLS_VIDEO_URL;
  } catch {
    const local = localStorage.getItem('samuel_hero_video_url');
    return local || HLS_VIDEO_URL;
  }
}

// Save Hero Background Video URL
export async function saveHeroVideoUrl(videoUrl: string): Promise<void> {
  const persistentUrl = toPersistentUrl(videoUrl) || videoUrl;

  try {
    await fetch('/api/hero-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl: persistentUrl }),
    });
  } catch {
    // ignore
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_CONFIG, 'readwrite');
    const configStore = tx.objectStore(STORE_CONFIG);

    await new Promise<void>((resolve, reject) => {
      const req = configStore.put({ key: 'hero_video_url', videoUrl: persistentUrl, updatedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    try {
      localStorage.setItem('samuel_hero_video_url', persistentUrl);
    } catch {
      // ignore
    }
  } catch (err) {
    console.error('Error saving hero video url:', err);
    try {
      localStorage.setItem('samuel_hero_video_url', persistentUrl);
    } catch {
      // ignore
    }
  }
}

// Reset Hero Background Video URL
export async function resetHeroVideoUrl(): Promise<string> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_CONFIG, 'readwrite');
    tx.objectStore(STORE_CONFIG).delete('hero_video_url');
  } catch {
    // ignore
  }
  try {
    await fetch('/api/hero-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl: HLS_VIDEO_URL }),
    });
  } catch {
    // ignore
  }
  localStorage.removeItem('samuel_hero_video_url');
  return HLS_VIDEO_URL;
}

// Load Hero Section Configuration (Texts, Rotating Words, and Background Video)
export async function loadHeroConfig(): Promise<HeroConfig> {
  try {
    // 1. Try server first
    try {
      const res = await fetch('/api/hero-config');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.config) {
          return await hydrateHeroConfig(data.config);
        }
      }
    } catch {
      // Continue to IndexedDB
    }

    // 2. Read from IndexedDB
    const db = await openDB();
    const tx = db.transaction(STORE_CONFIG, 'readonly');
    const configStore = tx.objectStore(STORE_CONFIG);

    const record: { key: string; config: HeroConfig } | undefined = await new Promise((resolve) => {
      const req = configStore.get('hero_config');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(undefined);
    });

    if (record?.config) {
      return await hydrateHeroConfig(record.config);
    }

    // 3. Fallback to localStorage
    const local = localStorage.getItem('samuel_hero_config');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        return await hydrateHeroConfig(parsed);
      } catch {
        return DEFAULT_HERO_CONFIG;
      }
    }

    return DEFAULT_HERO_CONFIG;
  } catch {
    return DEFAULT_HERO_CONFIG;
  }
}

async function hydrateHeroConfig(raw: Partial<HeroConfig>): Promise<HeroConfig> {
  const merged: HeroConfig = {
    ...DEFAULT_HERO_CONFIG,
    ...raw,
    roles: Array.isArray(raw.roles) && raw.roles.length > 0 ? raw.roles : DEFAULT_HERO_CONFIG.roles,
  };

  if (merged.videoUrl && merged.videoUrl.startsWith('idb:')) {
    const mediaId = merged.videoUrl.replace('idb:', '');
    const file = await getMediaFile(mediaId);
    if (file) {
      merged.videoUrl = URL.createObjectURL(file.blob);
    }
  }

  return merged;
}

// Save Hero Section Configuration
export async function saveHeroConfig(config: HeroConfig): Promise<void> {
  const persistentConfig: HeroConfig = {
    ...config,
    videoUrl: toPersistentUrl(config.videoUrl) || config.videoUrl,
  };

  // 1. Save to server
  try {
    await fetch('/api/hero-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: persistentConfig }),
    });
  } catch {
    // ignore
  }

  // 2. Save to IndexedDB
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_CONFIG, 'readwrite');
    const configStore = tx.objectStore(STORE_CONFIG);

    await new Promise<void>((resolve, reject) => {
      const req = configStore.put({ key: 'hero_config', config: persistentConfig, updatedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    try {
      localStorage.setItem('samuel_hero_config', JSON.stringify(persistentConfig));
    } catch {
      // ignore
    }
  } catch (err) {
    console.error('Error saving hero config:', err);
    try {
      localStorage.setItem('samuel_hero_config', JSON.stringify(persistentConfig));
    } catch {
      // ignore
    }
  }

  // Also sync hero_video_url for backward compatibility
  if (persistentConfig.videoUrl) {
    saveHeroVideoUrl(persistentConfig.videoUrl).catch(() => {});
  }
}

// Reset Hero Section Configuration
export async function resetHeroConfig(): Promise<HeroConfig> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_CONFIG, 'readwrite');
    tx.objectStore(STORE_CONFIG).delete('hero_config');
  } catch {
    // ignore
  }
  try {
    await fetch('/api/hero-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: DEFAULT_HERO_CONFIG }),
    });
  } catch {
    // ignore
  }
  localStorage.removeItem('samuel_hero_config');
  return DEFAULT_HERO_CONFIG;
}

