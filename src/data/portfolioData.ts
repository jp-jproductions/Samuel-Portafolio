import { Project, JournalEntry, Exploration, StatItem, ResumeData, VisualLabConfig, HeroConfig } from '../types';

export const HERO_ROLES = ["Creatividad", "Carros", "Mercadeo", "Locura", "Viajar"] as const;

export const LOADING_WORDS = ["Creatividad", "Mercadeo", "Locura"] as const;

export const HLS_VIDEO_URL = "https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8";

export const DEFAULT_HERO_CONFIG: HeroConfig = {
  eyebrow: "UNIVERSIDAD EAFIT • MEDELLÍN '26",
  name: "Samuel Restrepo",
  rolesPrefix: "Impulsado por",
  roles: ["Creatividad", "Carros", "Mercadeo", "Locura", "Viajar"],
  rolesSuffix: "en la Universidad EAFIT.",
  description: "Portafolio de proyectos universitarios en EAFIT. Integrando estrategia de mercadeo, devoción por los carros, mente viajera y una dosis de locura creativa para crear experiencias memorables.",
  primaryButtonText: "Ver Proyectos",
  secondaryButtonText: "Contáctame...",
  videoUrl: HLS_VIDEO_URL,
};

export const PROJECTS: Project[] = [
  {
    id: "estrategia-automotriz-eafit",
    title: "Mercadeo Automotriz",
    year: "2026",
    span: "col-span-1 md:col-span-7",
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=80",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-car-driving-through-the-city-at-night-4158-large.mp4",
    videoFormat: "reels",
    tags: ["Reels", "Mercadeo", "Carros", "EAFIT"],
    gallery: [
      {
        id: "m-1",
        type: "video",
        url: "https://assets.mixkit.co/videos/preview/mixkit-sports-car-drifting-on-a-racetrack-41364-large.mp4",
        videoFormat: "reels",
        name: "Reels Pista & Drift",
        date: "2026-1"
      },
      {
        id: "m-2",
        type: "image",
        url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80",
        name: "Bólido en Estudio",
        date: "2026-1"
      }
    ]
  },
  {
    id: "campana-locura-creativa",
    title: "Laboratorio de Locura Creativa",
    year: "2025",
    span: "col-span-1 md:col-span-5",
    image: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=1600&q=80",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-in-time-lapse-43187-large.mp4",
    videoFormat: "tiktok",
    tags: ["TikTok", "Creatividad", "Locura", "BTL"],
    gallery: [
      {
        id: "m-3",
        type: "video",
        url: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-with-a-vertical-screen-41530-large.mp4",
        videoFormat: "tiktok",
        name: "TikTok Viral EAFIT",
        date: "2025-2"
      },
      {
        id: "m-4",
        type: "image",
        url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
        name: "Activación en Campus",
        date: "2025-2"
      }
    ]
  },
  {
    id: "ruta-viajera-ecoturismo",
    title: "Expedición & Rutas de Viaje",
    year: "2025",
    span: "col-span-1 md:col-span-5",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-highway-surrounded-by-forest-42828-large.mp4",
    videoFormat: "historia",
    tags: ["Historia", "Viajes", "Storytelling", "Aventura"],
    gallery: [
      {
        id: "m-5",
        type: "video",
        url: "https://assets.mixkit.co/videos/preview/mixkit-driving-on-a-winding-road-through-a-mountain-pass-42827-large.mp4",
        videoFormat: "historia",
        name: "Historia de Ruta",
        date: "2025-1"
      },
      {
        id: "m-6",
        type: "image",
        url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
        name: "Atardecer en Carretera",
        date: "2025-1"
      }
    ]
  },
  {
    id: "velocidad-diseno-comunidad",
    title: "Comunidad de Cultura Automotriz",
    year: "2026",
    span: "col-span-1 md:col-span-7",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80",
    videoFormat: "horizontal",
    tags: ["Horizontal", "Carros", "Eventos", "Comunidad"],
    gallery: [
      {
        id: "m-7",
        type: "image",
        url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
        name: "Paddock y Telemetría",
        date: "2026-2"
      }
    ]
  }
];

export const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "mercadeo-automotriz-pasion",
    title: "Carros y Emoción: Cómo el Mercadeo Vende Sensaciones y No Solo Motores",
    date: "OCT 2026",
    readTime: "4 MIN DE LECTURA",
    category: "Mercadeo & Carros",
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
    excerpt: "Por qué las grandes marcas de automóviles construyen cultos de fidelidad basados en adrenalina, sonido y diseño.",
    content: [
      "En el mercadeo automotriz no se comercializan fichas técnicas ni caballos de fuerza; se vende la promesa de libertad, el rugido que eriza la piel y el estatus de dominar el asfalto.",
      "Durante mis investigaciones en la Universidad EAFIT, he analizado cómo marcas legendarias transforman el transporte diario en una experiencia casi mística. La clave está en conectar la ingeniería precisa con la psicología del deseo.",
      "Cuando combinas una estrategia de mercadeo sólida con la pasión genuina por los autos, el resultado no es un cliente: es un embajador incondicional de la marca."
    ]
  },
  {
    id: "locura-creativa-innovacion",
    title: "La Locura Creativa: El Antídoto a los Planes de Negocio Aburridos",
    date: "SEP 2026",
    readTime: "5 MIN DE LECTURA",
    category: "Creatividad & Locura",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
    excerpt: "Las ideas lógicas generan resultados promedio. Las ideas audaces que rozan la locura son las que revolucionan mercados.",
    content: [
      "En las aulas universitarias muchas veces se premia la prudencia. Sin embargo, en el mundo real, los proyectos que capturan la atención nacen de lo imprevisto y de cuestionar lo establecido.",
      "Para mí, la 'locura' no es falta de orden; es el coraje de proponer lo que otros descartan por considerarlo demasiado atrevido. Es llevar la creatividad al límite para encontrar soluciones de mercadeo memorables.",
      "Un buen mercadólogo debe saber cuándo analizar datos y cuándo lanzar una campaña tan electrizante que nadie pueda ignorarla."
    ]
  },
  {
    id: "viajar-para-abrir-mente",
    title: "Viajar como Escuela de Vida y Fuente Inagotable de Inspiración",
    date: "AGO 2026",
    readTime: "6 MIN DE LECTURA",
    category: "Viajes & Cultura",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
    excerpt: "Cada carretera recorrida y cada destino nuevo transforman nuestra visión del comportamiento humano.",
    content: [
      "Viajar es mucho más que acumular kilómetros o sellos en el pasaporte; es una lección acelerada de adaptabilidad, empatía y comprensión intercultural.",
      "Al recorrer distintas geografías y observar cómo conviven las comunidades, descubro patrones de consumo, rituales urbanos e historias que ningún libro de texto en el aula te puede enseñar.",
      "Cada viaje alimenta mi creatividad en EAFIT, permitiéndome diseñar estrategias con una mirada global, fresca y sensible al entorno."
    ]
  },
  {
    id: "experiencia-eafit-aprendizaje",
    title: "Mi Recorrido en EAFIT: Proyectos que Retan lo Académico",
    date: "JUL 2026",
    readTime: "4 MIN DE LECTURA",
    category: "Vida Universitaria",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    excerpt: "Cómo la Universidad EAFIT se ha convertido en mi laboratorio para experimentar con proyectos reales y audaces.",
    content: [
      "EAFIT no es solo un campus verde y acogedor en Medellín; es un ecosistema de innovación constante donde los estudiantes podemos arriesgarnos a construir cosas reales.",
      "Desde proyectos de mercadeo estratégico hasta iniciativas centradas en movilidad y automovilismo, cada semestre ha sido una oportunidad para poner a prueba ideas locas con rigor metodológico.",
      "El valor de la universidad reside en los equipos que formas, la mentoría de los profesores y las ganas compartidas de dejar una huella positiva en nuestra sociedad."
    ]
  }
];

export const EXPLORATIONS: Exploration[] = [
  {
    id: "exp-1",
    title: "Prototipo Aerodinámico 01",
    medium: "Boceto & Renders de Autos",
    year: "2026",
    category: "Automotriz",
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
    rotation: "-rotate-3",
    description: "Estudio visual y aerodinámico explorando líneas fluidas para bólidos deportivos eléctricos."
  },
  {
    id: "exp-2",
    title: "Bitácora de Viaje: Rutas Andinas",
    medium: "Fotografía & Storytelling",
    year: "2026",
    category: "Fotografía & Viajes",
    image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80",
    rotation: "rotate-2",
    description: "Registro visual en carretera capturando contrastes de luz y curvas montañosas en Antioquia."
  },
  {
    id: "exp-3",
    title: "Branding Irreverente",
    medium: "Diseño Gráfico & Publicidad",
    year: "2025",
    category: "Branding & EAFIT",
    image: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=800&q=80",
    rotation: "-rotate-2",
    description: "Cartelería experimental jugando con tipografías caóticas y composiciones de alto impacto."
  },
  {
    id: "exp-4",
    title: "Rally Nocturno Visual",
    medium: "Edición & Cinematografía",
    year: "2025",
    category: "Automotriz",
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
    rotation: "rotate-3",
    description: "Composición de estelas de luces y velocidad capturadas en pruebas de pista."
  },
  {
    id: "exp-5",
    title: "Mapa de Expediciones",
    medium: "Cartografía de Aventura",
    year: "2025",
    category: "Fotografía & Viajes",
    image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80",
    rotation: "-rotate-1",
    description: "Mapeo interactivo de destinos inexplorados para viajeros que buscan salir de lo convencional."
  },
  {
    id: "exp-6",
    title: "Campaña Disruptiva EAFIT",
    medium: "Activación Conceptual",
    year: "2025",
    category: "Branding & EAFIT",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
    rotation: "rotate-2",
    description: "Propuesta de guerrilla marketing para promover el talento joven e innovador en Medellín."
  },
  {
    id: "exp-7",
    title: "Geometría de Chasis & Downforce",
    medium: "Modelado 3D & Aerodinámica",
    year: "2026",
    category: "Automotriz",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    rotation: "-rotate-2",
    description: "Estudio técnico de flujo de aire y balance dinámico en alerones de competición."
  },
  {
    id: "exp-8",
    title: "Atardecer en Desierto de la Tatacoa",
    medium: "Fotografía Documental & Expedición",
    year: "2025",
    category: "Fotografía & Viajes",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
    rotation: "rotate-1",
    description: "Expedición fotográfica documentando el contraste de tonos ocres y siluetas en ruta off-road."
  },
  {
    id: "exp-9",
    title: "Pits & Telemetría en Pista",
    medium: "Reportaje Gráfico Automotriz",
    year: "2026",
    category: "Automotriz",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    rotation: "rotate-3",
    description: "Detalles mecánicos, ajustes de neumáticos y adrenalina en el paddock de automovilismo."
  },
  {
    id: "exp-10",
    title: "Tipografía Cinética & Ruido",
    medium: "Motion Graphics & 3D",
    year: "2025",
    category: "3D & Experimentos",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    rotation: "-rotate-3",
    description: "Exploración de fluidos digitales y formas tipográficas distorsionadas en alta fidelidad."
  },
  {
    id: "exp-11",
    title: "Instalación Sensorial en EAFIT",
    medium: "Diseño Espacial & Activación",
    year: "2025",
    category: "Branding & EAFIT",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
    rotation: "rotate-2",
    description: "Espacio inmersivo efímero para conectar a marcas emergentes con la comunidad universitaria."
  },
  {
    id: "exp-12",
    title: "Niebla en Carretera de Páramo",
    medium: "Fotografía de Paisaje Andino",
    year: "2026",
    category: "Fotografía & Viajes",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    rotation: "-rotate-1",
    description: "Captura de atmósfera densa y serenidad en la cordillera central colombiana durante travesía matutina."
  },
  {
    id: "exp-13",
    title: "Render Hiperrealista Bólido GT",
    medium: "CGI & Iluminación Automotriz",
    year: "2026",
    category: "Automotriz",
    image: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
    rotation: "rotate-2",
    description: "Pruebas de materiales de fibra de carbono expuesta y reflejos de estudio fotográfico."
  },
  {
    id: "exp-14",
    title: "Póster Serigráfico de Taller",
    medium: "Gráfica Impresa & Risografía",
    year: "2025",
    category: "Branding & EAFIT",
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80",
    rotation: "-rotate-2",
    description: "Diseño de cartel analógico rindiendo homenaje al olor a gasolina, grasa y creatividad técnica."
  }
];

export const STATS: StatItem[] = [
  {
    number: "5+",
    label: "Años en EAFIT",
    description: "Formándome con excelencia académica, liderazgo estudiantil y proyectos prácticos de alto impacto."
  },
  {
    number: "20+",
    label: "Proyectos Realizados",
    description: "Retos universitarios en mercadeo, creatividad de marca, eventos del sector automotriz y viajes."
  },
  {
    number: "100%",
    label: "Pasión & Entrega",
    description: "Energía incombustible combinando creatividad, locura constructiva y disciplina estratégica."
  }
];

export const SOCIAL_LINKS = [
  { name: "LinkedIn", url: "https://www.linkedin.com/in/samuel-restrepo-raigoza-51134a274", handle: "samuel-restrepo-raigoza" },
  { name: "Instagram", url: "https://www.instagram.com/rr14samuel", handle: "@rr14samuel" }
];

export const DEFAULT_RESUME: ResumeData = {
  name: "Samuel Restrepo",
  headline: "Estudiante en la Universidad EAFIT",
  bio: "Estudiante en la Universidad EAFIT caracterizado por una combinación vibrante de mercadeo, fascinación por los carros, espíritu viajero y la locura creativa necesaria para concebir ideas disruptivas.",
  email: "samuelrestreporaigoza@gmail.com",
  location: "Medellín, Antioquia, Colombia",
  university: "Universidad EAFIT",
  universityLocation: "Medellín, Colombia",
  degreeDescription: "Pregrado con enfoque en Mercadeo, Estrategia Creativa y Negocios Globales.",
  customPdfUrl: "/Samuel_Restrepo_CV.pdf",
  customPdfName: "Samuel_Restrepo_CV_EAFIT_2026.pdf",
  pillars: [
    { title: "Creatividad", subtitle: "Ideas audaces" },
    { title: "Carros", subtitle: "Diseño & Motor" },
    { title: "Mercadeo", subtitle: "Estrategia" },
    { title: "Locura", subtitle: "Sin límites" },
    { title: "Viajar", subtitle: "Aventura" },
  ],
  experiences: [
    {
      id: "exp-1",
      role: "Líder de Mercadeo Automotriz",
      period: "2025 — 2026",
      company: "EAFIT Motor Lab • Medellín",
      description: "Estrategia de posicionamiento de marca y experiencia inmersiva para el mercado de vehículos deportivos y de vanguardia."
    },
    {
      id: "exp-2",
      role: "Director de Campañas Disruptivas",
      period: "2024 — 2025",
      company: "Laboratorio de Creatividad EAFIT",
      description: "Conceptualización y montaje de activaciones sorpresa en el campus universitario con más de 12.000 impactos directos."
    },
    {
      id: "exp-3",
      role: "Co-creador de Rutas de Viaje",
      period: "2024",
      company: "Semillero EAFIT Emprende",
      description: "Desarrollo de una plataforma de storytelling fotográfico y rutas turísticas por carretera en Colombia."
    }
  ],
  awards: [
    {
      id: "award-1",
      title: "Mención de Honor al Mejor Proyecto de Mercadeo",
      year: "EAFIT 2025"
    },
    {
      id: "award-2",
      title: "Finalista Reto de Innovación y Creatividad de Marca",
      year: "EAFIT 2025"
    }
  ]
};

export const DEFAULT_VISUAL_LAB_CONFIG: VisualLabConfig = {
  eyebrow: "Exploraciones",
  titleMain: "Laboratorio",
  titleItalic: "visual",
  description: "Bocetos automotrices, diarios de viaje fotográficos, activaciones de marca y experimentos gráficos en EAFIT.",
  buttonText: "VER MÁS",
  instagramUrl: "https://www.instagram.com/rr14samuel"
};

