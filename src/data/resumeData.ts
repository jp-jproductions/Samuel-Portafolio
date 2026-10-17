import { ResumeData } from '../types';

export const DEFAULT_RESUME: ResumeData = {
  name: 'Samuel Restrepo',
  headline: 'Universidad EAFIT • Medellín, Colombia',
  email: 'samuelrestreporaigoza@gmail.com',
  location: 'Medellín, Antioquia, Colombia',
  bio: 'Estudiante en la Universidad EAFIT caracterizado por una combinación vibrante de mercadeo, fascinación por los carros, espíritu viajero y la locura creativa necesaria para concebir ideas disruptivas.',
  university: 'Universidad EAFIT',
  universityLocation: 'Medellín, Antioquia, Colombia',
  degreeDescription: 'Pregrado con enfoque en Mercadeo, Estrategia Creativa y Negocios Globales.',
  pillars: [
    { title: 'Creatividad', subtitle: 'Ideas audaces' },
    { title: 'Carros', subtitle: 'Diseño & Motor' },
    { title: 'Mercadeo', subtitle: 'Estrategia' },
    { title: 'Locura', subtitle: 'Sin límites' },
    { title: 'Viajar', subtitle: 'Aventura' },
  ],
  experiences: [
    {
      id: 'exp-1',
      role: 'Líder de Mercadeo Automotriz',
      period: '2025 — 2026',
      company: 'EAFIT Motor Lab • Medellín',
      description: 'Estrategia de posicionamiento de marca y experiencia inmersiva para el mercado de vehículos deportivos y de vanguardia.'
    },
    {
      id: 'exp-2',
      role: 'Director de Campañas Disruptivas',
      period: '2024 — 2025',
      company: 'Laboratorio de Creatividad EAFIT',
      description: 'Conceptualización y montaje de activaciones sorpresa en el campus universitario con más de 12.000 impactos directos.'
    },
    {
      id: 'exp-3',
      role: 'Co-creador de Rutas de Viaje',
      period: '2024',
      company: 'Semillero EAFIT Emprende',
      description: 'Desarrollo de una plataforma de storytelling fotográfico y rutas turísticas por carretera en Colombia.'
    }
  ],
  awards: [
    {
      id: 'aw-1',
      title: 'Mención de Honor al Mejor Proyecto de Mercadeo',
      year: 'EAFIT 2025'
    },
    {
      id: 'aw-2',
      title: 'Finalista Reto de Innovación y Creatividad de Marca',
      year: 'EAFIT 2025'
    }
  ]
};
