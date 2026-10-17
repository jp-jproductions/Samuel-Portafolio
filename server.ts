import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON with generous limit for data URLs/config
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Ensure upload & data directories exist
const UPLOADS_DIR = path.resolve(__dirname, 'public', 'uploads');
const DATA_DIR = path.resolve(__dirname, 'public', 'data');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    // Sanitize filename and prepend timestamp
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}-${cleanName}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 }, // 250MB limit for high quality video (.MOV/.MP4) and photos
});

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// 1. Upload single media file
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No se envió ningún archivo' });
    }

    const file = req.file;
    const fileName = file.filename;
    const url = `/uploads/${fileName}`;

    // Determine type
    const ext = path.extname(file.originalname).toLowerCase();
    let type = 'image';
    if (ext === '.pdf') {
      type = 'pdf';
    } else if (['.mov', '.mp4', '.webm', '.m4v'].includes(ext) || file.mimetype.startsWith('video/')) {
      type = 'video';
    }

    return res.json({
      success: true,
      url,
      name: file.originalname,
      fileName,
      type,
      size: formatBytes(file.size),
    });
  } catch (err: any) {
    console.error('Error in /api/upload:', err);
    return res.status(500).json({ success: false, error: err.message || 'Error al procesar subida' });
  }
});

// 2. Upload multiple media files
app.post('/api/upload-multiple', upload.array('files', 20), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No se enviaron archivos' });
    }

    const uploaded = files.map((file) => {
      const ext = path.extname(file.originalname).toLowerCase();
      let type = 'image';
      if (ext === '.pdf') {
        type = 'pdf';
      } else if (['.mov', '.mp4', '.webm', '.m4v'].includes(ext) || file.mimetype.startsWith('video/')) {
        type = 'video';
      }
      return {
        url: `/uploads/${file.filename}`,
        name: file.originalname,
        fileName: file.filename,
        type,
        size: formatBytes(file.size),
      };
    });

    return res.json({ success: true, files: uploaded });
  } catch (err: any) {
    console.error('Error in /api/upload-multiple:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Projects persistence
const PROJECTS_FILE = path.join(DATA_DIR, 'custom_projects.json');

app.get('/api/projects', (_req, res) => {
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
      return res.json({ success: true, projects: data });
    }
    return res.json({ success: true, projects: null });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/projects', (req, res) => {
  try {
    const { projects } = req.body;
    if (!projects || !Array.isArray(projects)) {
      return res.status(400).json({ success: false, error: 'Formato inválido de proyectos' });
    }
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
    return res.json({ success: true, count: projects.length });
  } catch (err: any) {
    console.error('Error saving projects:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Explorations persistence
const EXPLORATIONS_FILE = path.join(DATA_DIR, 'custom_explorations.json');

app.get('/api/explorations', (_req, res) => {
  try {
    if (fs.existsSync(EXPLORATIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(EXPLORATIONS_FILE, 'utf-8'));
      return res.json({ success: true, explorations: data });
    }
    return res.json({ success: true, explorations: null });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/explorations', (req, res) => {
  try {
    const { explorations } = req.body;
    if (!explorations || !Array.isArray(explorations)) {
      return res.status(400).json({ success: false, error: 'Formato inválido' });
    }
    fs.writeFileSync(EXPLORATIONS_FILE, JSON.stringify(explorations, null, 2), 'utf-8');
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Hero Video persistence
const HERO_VIDEO_FILE = path.join(DATA_DIR, 'custom_hero_video.json');

app.get('/api/hero-video', (_req, res) => {
  try {
    if (fs.existsSync(HERO_VIDEO_FILE)) {
      const data = JSON.parse(fs.readFileSync(HERO_VIDEO_FILE, 'utf-8'));
      return res.json({ success: true, videoUrl: data.videoUrl });
    }
    return res.json({ success: true, videoUrl: null });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

const HERO_CONFIG_FILE = path.join(DATA_DIR, 'custom_hero_config.json');

app.get('/api/hero-config', (_req, res) => {
  try {
    if (fs.existsSync(HERO_CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(HERO_CONFIG_FILE, 'utf-8'));
      return res.json({ success: true, config: data });
    }
    return res.json({ success: true, config: null });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/hero-config', (req, res) => {
  try {
    const { config } = req.body;
    if (!config || typeof config !== 'object') {
      return res.status(400).json({ success: false, error: 'Configuración inválida' });
    }
    fs.writeFileSync(HERO_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/hero-video', (req, res) => {
  try {
    const { videoUrl } = req.body;
    fs.writeFileSync(HERO_VIDEO_FILE, JSON.stringify({ videoUrl, updatedAt: Date.now() }, null, 2), 'utf-8');
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Serve /uploads explicitly as static
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(path.resolve(__dirname, 'public')));

// Mount Vite or serve static dist in production
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
