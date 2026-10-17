import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function generateCV() {
  const pdfDoc = await PDFDocument.create();
  
  // A4 size: 595.28 x 841.89 points
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const fontBoldOblique = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

  // Colors
  const darkNavy = rgb(15 / 255, 23 / 255, 42 / 255);       // #0F172A
  const primaryBlue = rgb(41 / 255, 98 / 255, 153 / 255);   // #296299
  const accentBlue = rgb(137 / 255, 170 / 255, 204 / 255);  // #89AACC
  const textDark = rgb(30 / 255, 41 / 255, 59 / 255);       // #1E293B
  const textMuted = rgb(100 / 255, 116 / 255, 139 / 255);   // #64748B
  const lightBg = rgb(248 / 255, 250 / 255, 252 / 255);     // #F8FAFC
  const borderLight = rgb(226 / 255, 232 / 255, 240 / 255); // #E2E8F0

  // Top header background band
  page.drawRectangle({
    x: 0,
    y: height - 125,
    width: width,
    height: 125,
    color: darkNavy,
  });

  // Thin accent line below header
  page.drawRectangle({
    x: 0,
    y: height - 128,
    width: width,
    height: 3,
    color: accentBlue,
  });

  // Header Title
  page.drawText('SAMUEL RESTREPO RAIGOZA', {
    x: 40,
    y: height - 48,
    size: 24,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // Subtitle
  page.drawText('UNIVERSIDAD EAFIT  •  MERCADEO & ESTRATEGIA CREATIVA  •  CLASE 2026', {
    x: 40,
    y: height - 68,
    size: 9.5,
    font: fontBold,
    color: accentBlue,
  });

  // Contact line in header
  const contactText = 'Medellin, Colombia  |  samuelrestreporaigoza@gmail.com  |  LinkedIn: samuel-restrepo-raigoza  |  IG: @rr14samuel';
  page.drawText(contactText, {
    x: 40,
    y: height - 90,
    size: 8.5,
    font: fontRegular,
    color: rgb(203 / 255, 213 / 255, 225 / 255),
  });

  let currentY = height - 150;

  // Helper for section headings
  const drawSectionHeading = (title: string, yPos: number) => {
    page.drawText(title.toUpperCase(), {
      x: 40,
      y: yPos,
      size: 11,
      font: fontBold,
      color: primaryBlue,
    });
    page.drawLine({
      start: { x: 40, y: yPos - 4 },
      end: { x: width - 40, y: yPos - 4 },
      thickness: 1,
      color: borderLight,
    });
    return yPos - 18;
  };

  // 1. PERFIL PROFESIONAL
  currentY = drawSectionHeading('Perfil & Declaración Profesional', currentY);
  
  const bioLines = [
    'Estudiante de pregrado en la Universidad EAFIT con graduación prevista en 2026. Perfil dinámico que combina',
    'el rigor del mercadeo estratégico con la pasión por el diseño automotriz, la exploración de viajes y un enfoque disruptivo',
    'y creativo orientado a generar impacto real en marcas y audiencias contemporáneas.',
    'Orientado a la resolución audaz de problemas, conceptualización de activaciones de marca y dirección de proyectos.'
  ];

  bioLines.forEach((line) => {
    page.drawText(line, {
      x: 40,
      y: currentY,
      size: 9,
      font: fontRegular,
      color: textDark,
      lineHeight: 13,
    });
    currentY -= 14;
  });

  currentY -= 8;

  // 2. LOS 5 PILARES
  currentY = drawSectionHeading('Pilares de Identidad & ADN Creativo', currentY);

  const pillars = [
    { title: 'Creatividad', desc: 'Ideas audaces sin miedo al riesgo' },
    { title: 'Carros', desc: 'Fascinación técnica y estética automotriz' },
    { title: 'Mercadeo', desc: 'Estrategia orientada a conexión humana' },
    { title: 'Locura', desc: 'Pensamiento divergente e innovación' },
    { title: 'Viajar', desc: 'Apertura cultural y aprendizaje constante' },
  ];

  const pillarBoxWidth = (width - 80 - 4 * 8) / 5;
  pillars.forEach((p, idx) => {
    const boxX = 40 + idx * (pillarBoxWidth + 8);
    page.drawRectangle({
      x: boxX,
      y: currentY - 32,
      width: pillarBoxWidth,
      height: 34,
      color: lightBg,
      borderColor: borderLight,
      borderWidth: 1,
    });

    page.drawText(p.title, {
      x: boxX + 6,
      y: currentY - 14,
      size: 9.5,
      font: fontBold,
      color: primaryBlue,
    });

    page.drawText(p.desc, {
      x: boxX + 6,
      y: currentY - 26,
      size: 6.5,
      font: fontRegular,
      color: textMuted,
    });
  });

  currentY -= 48;

  // 3. TRAYECTORIA Y PROYECTOS
  currentY = drawSectionHeading('Trayectoria & Proyectos Destacados (Universidad EAFIT)', currentY);

  const experiences = [
    {
      role: 'Líder de Mercadeo y Activación Automotriz',
      org: 'EAFIT Motor Lab • Medellín',
      period: '2025 — 2026',
      desc: 'Dirección de la estrategia de posicionamiento de marca, vinculación con firmas del sector de movilidad y diseño de experiencias inmersivas para bólidos y vehículos de exhibición.',
      bullets: [
        'Estrategia de comunicación y engagement en eventos y circuitos de exhibición universitaria.',
        'Articulación de contenido multimedia con enfoque en aerodinámica, tecnología y deportividad.',
      ],
    },
    {
      role: 'Director de Campañas Disruptivas & Storytelling',
      org: 'Laboratorio de Creatividad EAFIT',
      period: '2024 — 2025',
      desc: 'Conceptualización y despliegue de intervenciones de marca en el campus universitario con más de 12.000 impactos directos entre la comunidad estudiantil.',
      bullets: [
        'Liderazgo de equipos multidisciplinarios en campañas de alta viralidad.',
        'Medición de efectividad de impacto cualitativo y recordación de mensaje.',
      ],
    },
    {
      role: 'Co-creador de Rutas & Contenido de Expedición',
      org: 'Semillero EAFIT Emprende',
      period: '2024',
      desc: 'Desarrollo de plataforma de storytelling fotográfico y rutas turísticas por carretera en Antioquia y Colombia.',
      bullets: [
        'Producción visual de diarios de ruta, fotografía documental y reportajes de campo.',
      ],
    },
  ];

  experiences.forEach((exp) => {
    page.drawText(exp.role, {
      x: 40,
      y: currentY,
      size: 10,
      font: fontBold,
      color: textDark,
    });

    page.drawText(exp.period, {
      x: width - 40 - fontBold.widthOfTextAtSize(exp.period, 9),
      y: currentY,
      size: 9,
      font: fontBold,
      color: primaryBlue,
    });

    currentY -= 13;

    page.drawText(exp.org, {
      x: 40,
      y: currentY,
      size: 8.5,
      font: fontOblique,
      color: textMuted,
    });

    currentY -= 13;

    page.drawText(exp.desc, {
      x: 40,
      y: currentY,
      size: 8.5,
      font: fontRegular,
      color: textDark,
    });

    currentY -= 12;

    exp.bullets.forEach((b) => {
      page.drawText(`•  ${b}`, {
        x: 48,
        y: currentY,
        size: 8,
        font: fontRegular,
        color: textMuted,
      });
      currentY -= 11;
    });

    currentY -= 6;
  });

  // 4. FORMACIÓN ACADÉMICA
  currentY = drawSectionHeading('Educación & Formación Universitaria', currentY);

  page.drawText('Universidad EAFIT', {
    x: 40,
    y: currentY,
    size: 10,
    font: fontBold,
    color: textDark,
  });

  page.drawText('2021 — 2026 (Graduación)', {
    x: width - 40 - fontBold.widthOfTextAtSize('2021 — 2026 (Graduación)', 9),
    y: currentY,
    size: 9,
    font: fontBold,
    color: primaryBlue,
  });

  currentY -= 13;

  page.drawText('Pregrado en Mercadeo • Énfasis en Creatividad Estratégica & Negocios', {
    x: 40,
    y: currentY,
    size: 8.5,
    font: fontRegular,
    color: textMuted,
  });

  currentY -= 20;

  // 5. RECONOCIMIENTOS Y COMPETENCIAS
  currentY = drawSectionHeading('Reconocimientos Universitarios & Competencias Clave', currentY);

  const awards = [
    { title: 'Mención de Honor al Mejor Proyecto de Mercadeo', year: 'EAFIT 2025' },
    { title: 'Finalista Reto de Innovación y Creatividad de Marca', year: 'EAFIT 2025' },
    { title: 'Reconocimiento al Liderazgo Estudiantil en Activaciones', year: 'EAFIT 2024' },
  ];

  awards.forEach((aw) => {
    page.drawText(`-  ${aw.title}`, {
      x: 40,
      y: currentY,
      size: 8.5,
      font: fontRegular,
      color: textDark,
    });
    page.drawText(aw.year, {
      x: width - 40 - fontBold.widthOfTextAtSize(aw.year, 8.5),
      y: currentY,
      size: 8.5,
      font: fontBold,
      color: primaryBlue,
    });
    currentY -= 12;
  });

  currentY -= 10;

  // Footer bar
  page.drawLine({
    start: { x: 40, y: 35 },
    end: { x: width - 40, y: 35 },
    thickness: 0.5,
    color: borderLight,
  });

  page.drawText('Currículum Vitae Oficial — Samuel Restrepo Raigoza — Universidad EAFIT Medellín, 2026', {
    x: 40,
    y: 22,
    size: 7.5,
    font: fontRegular,
    color: textMuted,
  });

  page.drawText('Documento PDF Oficial', {
    x: width - 40 - fontBold.widthOfTextAtSize('Documento PDF Oficial', 7.5),
    y: 22,
    size: 7.5,
    font: fontBold,
    color: primaryBlue,
  });

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.resolve('public/Samuel_Restrepo_CV.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log('PDF generated at:', outputPath, 'bytes:', pdfBytes.length);
}

generateCV().catch(console.error);
