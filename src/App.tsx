/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LoadingScreen } from './components/LoadingScreen';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SelectedWorksSection } from './components/SelectedWorksSection';
import { ExplorationsSection } from './components/ExplorationsSection';
import { StatsSection } from './components/StatsSection';
import { ContactFooterSection } from './components/ContactFooterSection';
import { ProjectModal } from './components/ProjectModal';
import { LightboxModal } from './components/LightboxModal';
import { ResumeModal } from './components/ResumeModal';
import { AllWorkModal } from './components/AllWorkModal';
import { UploadMediaModal } from './components/UploadMediaModal';
import { ExplorationsGalleryModal } from './components/ExplorationsGalleryModal';
import { VisualLabManagerModal } from './components/VisualLabManagerModal';
import { HeroVideoModal } from './components/HeroVideoModal';
import { AdminCvModal } from './components/AdminCvModal';
import { Project, Exploration, ResumeData, VisualLabConfig, HeroConfig } from './types';
import {
  PROJECTS as DEFAULT_PROJECTS,
  DEFAULT_RESUME,
  EXPLORATIONS as DEFAULT_EXPLORATIONS,
  DEFAULT_VISUAL_LAB_CONFIG,
  DEFAULT_HERO_CONFIG,
  HLS_VIDEO_URL,
} from './data/portfolioData';
import {
  loadProjects,
  saveProjects,
  resetProjects,
  loadResume,
  saveResume,
  resetResume,
  loadExplorations,
  saveExplorations,
  resetExplorations,
  loadVisualLabConfig,
  saveVisualLabConfig,
  resetVisualLabConfig,
  loadHeroVideoUrl,
  saveHeroVideoUrl,
  resetHeroVideoUrl,
  loadHeroConfig,
  saveHeroConfig,
  resetHeroConfig,
} from './utils/mediaStorage';

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<'home' | 'work' | 'contact'>('home');

  // Dynamic projects list with IndexedDB persistence
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);

  // Dynamic resume state with IndexedDB persistence
  const [resumeData, setResumeData] = useState<ResumeData>(DEFAULT_RESUME);

  // Dynamic visual explorations with IndexedDB persistence
  const [explorations, setExplorations] = useState<Exploration[]>(DEFAULT_EXPLORATIONS);

  // Dynamic visual laboratory section configuration
  const [visualLabConfig, setVisualLabConfig] = useState<VisualLabConfig>(DEFAULT_VISUAL_LAB_CONFIG);

  // Dynamic hero section configuration (texts, rotating words, and background video)
  const [heroConfig, setHeroConfig] = useState<HeroConfig>(DEFAULT_HERO_CONFIG);

  // Dynamic hero background video (persists in IndexedDB / localStorage)
  const [heroVideoUrl, setHeroVideoUrl] = useState<string>(HLS_VIDEO_URL);

  // Modal states
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedExploration, setSelectedExploration] = useState<Exploration | null>(null);
  const [isResumeOpen, setIsResumeOpen] = useState<boolean>(false);
  const [isAllWorkOpen, setIsAllWorkOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [isVisualLabManagerOpen, setIsVisualLabManagerOpen] = useState<boolean>(false);
  const [isHeroVideoModalOpen, setIsHeroVideoModalOpen] = useState<boolean>(false);
  const [isAdminCvModalOpen, setIsAdminCvModalOpen] = useState<boolean>(false);

  // Check admin status dynamically
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return (
      typeof window !== 'undefined' &&
      (localStorage.getItem('samuel_admin_auth') === 'true' ||
        localStorage.getItem('samuel_admin_logged') === 'true')
    );
  });

  useEffect(() => {
    const checkAdmin = () => {
      const auth =
        localStorage.getItem('samuel_admin_auth') === 'true' ||
        localStorage.getItem('samuel_admin_logged') === 'true';
      setIsAdmin(auth);
    };
    window.addEventListener('storage', checkAdmin);
    const interval = setInterval(checkAdmin, 1000);
    return () => {
      window.removeEventListener('storage', checkAdmin);
      clearInterval(interval);
    };
  }, []);

  // Load custom projects, resume, visual explorations, and hero background video from IndexedDB on startup
  useEffect(() => {
    loadProjects().then((loaded) => {
      if (loaded && loaded.length > 0) {
        setProjects(loaded);
      }
    });

    loadResume().then((loadedResume) => {
      if (loadedResume) {
        setResumeData(loadedResume);
      }
    });

    loadExplorations().then((loadedExplorations) => {
      if (loadedExplorations && loadedExplorations.length > 0) {
        setExplorations(loadedExplorations);
      }
    });

    loadVisualLabConfig().then((loadedConfig) => {
      if (loadedConfig) {
        setVisualLabConfig(loadedConfig);
      }
    });

    loadHeroVideoUrl().then((loadedVideo) => {
      if (loadedVideo) {
        setHeroVideoUrl(loadedVideo);
      }
    });

    loadHeroConfig().then((loadedHero) => {
      if (loadedHero) {
        setHeroConfig(loadedHero);
        if (loadedHero.videoUrl) {
          setHeroVideoUrl(loadedHero.videoUrl);
        }
      }
    });
  }, []);

  // Save projects handler
  const handleSaveProjects = async (updated: Project[]) => {
    setProjects(updated);
    await saveProjects(updated);
    // If selectedProject is open, keep it in sync
    if (selectedProject) {
      const match = updated.find((p) => p.id === selectedProject.id);
      if (match) setSelectedProject(match);
    }
  };

  // Reset projects handler
  const handleResetProjects = async () => {
    const original = await resetProjects();
    setProjects(original);
    if (selectedProject) {
      const match = original.find((p) => p.id === selectedProject.id);
      setSelectedProject(match || null);
    }
  };

  // Save resume handler
  const handleSaveResume = async (updated: ResumeData) => {
    setResumeData(updated);
    await saveResume(updated);
  };

  // Reset resume handler
  const handleResetResume = async () => {
    const original = await resetResume();
    setResumeData(original);
  };

  // Save explorations handler
  const handleSaveExplorations = async (updated: Exploration[]) => {
    setExplorations(updated);
    await saveExplorations(updated);
  };

  // Reset explorations handler
  const handleResetExplorations = async () => {
    const original = await resetExplorations();
    setExplorations(original);
  };

  // Save visual lab section config handler
  const handleSaveVisualLabConfig = async (updated: VisualLabConfig) => {
    setVisualLabConfig(updated);
    await saveVisualLabConfig(updated);
  };

  // Reset entire visual lab (photos + config)
  const handleResetAllVisualLab = async () => {
    const originalExplorations = await resetExplorations();
    setExplorations(originalExplorations);
    const originalConfig = await resetVisualLabConfig();
    setVisualLabConfig(originalConfig);
  };

  // Hero Section & Looping Background Video handlers
  const handleSaveHeroConfig = async (newConfig: HeroConfig) => {
    setHeroConfig(newConfig);
    if (newConfig.videoUrl) {
      setHeroVideoUrl(newConfig.videoUrl);
    }
    await saveHeroConfig(newConfig);
  };

  const handleResetHeroConfig = async () => {
    const original = await resetHeroConfig();
    setHeroConfig(original);
    setHeroVideoUrl(original.videoUrl || HLS_VIDEO_URL);
  };

  const handleSaveHeroVideo = async (url: string) => {
    setHeroVideoUrl(url);
    const updated = { ...heroConfig, videoUrl: url };
    setHeroConfig(updated);
    await saveHeroConfig(updated);
  };

  const handleResetHeroVideo = async () => {
    const original = await resetHeroVideoUrl();
    setHeroVideoUrl(original);
    const updated = { ...heroConfig, videoUrl: original };
    setHeroConfig(updated);
  };

  // Active section observer on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 250;
      const heroEl = document.getElementById('hero');
      const workEl = document.getElementById('work');
      const contactEl = document.getElementById('contact');

      if (contactEl && scrollPos >= contactEl.offsetTop) {
        setActiveSection('contact');
      } else if (workEl && scrollPos >= workEl.offsetTop) {
        setActiveSection('work');
      } else {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary selection:bg-[#89AACC]/30 selection:text-white font-body relative overflow-x-hidden">
      {/* Section 1: Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {/* Fixed Navbar with Media Manager, Visual Lab edit, CV edit, and Video edit triggers */}
      <Navbar
        onOpenResume={() => setIsResumeOpen(true)}
        onOpenAdminCvModal={() => setIsAdminCvModalOpen(true)}
        onOpenMediaManager={() => setIsUploadModalOpen(true)}
        onOpenVisualLabEdit={() => setIsVisualLabManagerOpen(true)}
        onOpenVideoEdit={() => setIsHeroVideoModalOpen(true)}
        activeSection={activeSection}
      />

      {/* Main Content Sections */}
      <main>
        <HeroSection
          onSeeWorksClick={() => scrollToSection('work')}
          onReachOutClick={() => scrollToSection('contact')}
          videoUrl={heroConfig.videoUrl || heroVideoUrl}
          config={heroConfig}
          onOpenEdit={() => setIsHeroVideoModalOpen(true)}
          isAdmin={isAdmin}
        />

        {/* Section 3: Selected Works */}
        <SelectedWorksSection
          projects={projects}
          onSelectProject={(project) => setSelectedProject(project)}
          onViewAllClick={() => setIsAllWorkOpen(true)}
        />

        {/* Section 4: Explorations (Parallax Gallery) */}
        <ExplorationsSection
          onSelectExploration={(item) => setSelectedExploration(item)}
          onOpenGallery={() => setIsGalleryOpen(true)}
          explorations={explorations}
          config={visualLabConfig}
          onOpenEdit={() => setIsVisualLabManagerOpen(true)}
          isAdmin={isAdmin}
        />

        {/* Section 5: Stats */}
        <StatsSection />

        {/* Section 6: Contact / Footer */}
        <ContactFooterSection videoUrl={heroConfig.videoUrl || heroVideoUrl} />
      </main>

      {/* Interactive Modals */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <LightboxModal
        item={selectedExploration}
        onClose={() => setSelectedExploration(null)}
      />

      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
        resumeData={resumeData}
      />

      <AllWorkModal
        isOpen={isAllWorkOpen}
        onClose={() => setIsAllWorkOpen(false)}
        projects={projects}
        onSelectProject={(proj) => {
          setIsAllWorkOpen(false);
          setSelectedProject(proj);
        }}
      />

      {/* Media Upload & Manager Modal */}
      <UploadMediaModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        projects={projects}
        onSaveProjects={handleSaveProjects}
        onResetProjects={handleResetProjects}
      />

      {/* Visual Laboratory Gallery Modal */}
      <ExplorationsGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        explorations={explorations}
        config={visualLabConfig}
        onSaveExplorations={handleSaveExplorations}
        onResetExplorations={handleResetExplorations}
        onOpenEdit={() => {
          setIsGalleryOpen(false);
          setIsVisualLabManagerOpen(true);
        }}
        isAdmin={isAdmin}
      />

      {/* Visual Laboratory Admin Manager Modal */}
      <VisualLabManagerModal
        isOpen={isVisualLabManagerOpen}
        onClose={() => setIsVisualLabManagerOpen(false)}
        explorations={explorations}
        visualLabConfig={visualLabConfig}
        onSaveExplorations={handleSaveExplorations}
        onSaveConfig={handleSaveVisualLabConfig}
        onResetAll={handleResetAllVisualLab}
        onOpenPublicGallery={() => setIsGalleryOpen(true)}
      />

      {/* Hero Background Video & Texts Editor Modal */}
      <HeroVideoModal
        isOpen={isHeroVideoModalOpen}
        onClose={() => setIsHeroVideoModalOpen(false)}
        config={heroConfig}
        currentVideoUrl={heroConfig.videoUrl || heroVideoUrl}
        onSaveConfig={handleSaveHeroConfig}
        onResetConfig={handleResetHeroConfig}
        onSaveVideo={handleSaveHeroVideo}
        onResetVideo={handleResetHeroVideo}
      />

      {/* Admin CV PDF Manager Modal (Protected for Admin only) */}
      <AdminCvModal
        isOpen={isAdminCvModalOpen}
        onClose={() => setIsAdminCvModalOpen(false)}
        resumeData={resumeData}
        onSaveResume={handleSaveResume}
        onOpenPublicPreview={() => setIsResumeOpen(true)}
      />
    </div>
  );
}
