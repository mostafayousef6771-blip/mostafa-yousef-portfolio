import React, { useState, useEffect } from 'react';
import {
  Profile,
  About,
  Skill,
  Project,
  Certificate,
  Experience,
  Education,
  Review,
  SocialLink,
  Resume,
  ContactMessage,
} from './types/portfolio';
import { repository } from './lib/repository';
import { isSupabaseConfigured, supabase, initializeSupabase } from './lib/supabase';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ErrorBoundary } from './components/ErrorBoundary';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { SkillsPage } from './pages/public/SkillsPage';
import { ProjectsPage } from './pages/public/ProjectsPage';
import { ProjectDetailPage } from './pages/public/ProjectDetailPage';
import { CertificatesPage } from './pages/public/CertificatesPage';
import { ExperiencePage } from './pages/public/ExperiencePage';
import { EducationPage } from './pages/public/EducationPage';
import { ResumePage } from './pages/public/ResumePage';
import { ReviewsPage } from './pages/public/ReviewsPage';
import { ContactPage } from './pages/public/ContactPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';
import { AdminAboutPage } from './pages/admin/AdminAboutPage';
import { AdminSkillsPage } from './pages/admin/AdminSkillsPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminCertificatesPage } from './pages/admin/AdminCertificatesPage';
import { AdminExperiencePage } from './pages/admin/AdminExperiencePage';
import { AdminEducationPage } from './pages/admin/AdminEducationPage';
import { AdminResumePage } from './pages/admin/AdminResumePage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminSocialLinksPage } from './pages/admin/AdminSocialLinksPage';
import { AdminMessagesPage } from './pages/admin/AdminMessagesPage';
import { AdminMediaPage } from './pages/admin/AdminMediaPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [configLoading, setConfigLoading] = useState<boolean>(true);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Global State
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [about, setAbout] = useState<About | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [resume, setResume] = useState<Resume | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    let authSubscription: any = null;

    async function initApp() {
      setConfigLoading(true);
      const client = await initializeSupabase();
      await loadAllData();
      setConfigLoading(false);

      if (isSupabaseConfigured() && client) {
        const verifyAdminAuthorization = async (session: any) => {
          if (!session) {
            setIsAuthenticated(false);
            setAuthChecking(false);
            return;
          }

          try {
            const { data: isAdminRes, error: rpcErr } = await client.rpc('is_admin');
            if (!rpcErr && isAdminRes === true) {
              setIsAuthenticated(true);
            } else {
              await client.auth.signOut();
              setIsAuthenticated(false);
            }
          } catch {
            await client.auth.signOut();
            setIsAuthenticated(false);
          } finally {
            setAuthChecking(false);
          }
        };

        const { data: sessionData } = await client.auth.getSession();
        await verifyAdminAuthorization(sessionData?.session);

        const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
            if (session) {
              await verifyAdminAuthorization(session);
            } else {
              setIsAuthenticated(false);
              setAuthChecking(false);
            }
          } else if (event === 'SIGNED_OUT') {
            setIsAuthenticated(false);
            setAuthChecking(false);
          }
        });

        authSubscription = authListener?.subscription;
      } else {
        setAuthChecking(false);
        setIsAuthenticated(false);
      }
    }

    initApp();

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    setCurrentPath(path);
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        pData,
        aData,
        sData,
        projData,
        cData,
        expData,
        eduData,
        rData,
        socData,
        resData,
        msgData,
      ] = await Promise.all([
        repository.getProfile(),
        repository.getAbout(),
        repository.getSkills(),
        repository.getProjects(false),
        repository.getCertificates(),
        repository.getExperiences(),
        repository.getEducations(),
        repository.getReviews(false),
        repository.getSocialLinks(false),
        repository.getResume(),
        repository.getMessages(),
      ]);

      setProfile(pData);
      setAbout(aData);
      setSkills(sData || []);
      setProjects(projData || []);
      setCertificates(cData || []);
      setExperiences(expData || []);
      setEducations(eduData || []);
      setReviews(rData || []);
      setSocialLinks(socData || []);
      setResume(resData);
      setMessages(msgData || []);
    } catch (err) {
      console.error('Error fetching portfolio data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/admin');
  };

  const handleLogout = async (targetPath = '/admin/login') => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    setIsAuthenticated(false);
    navigate(targetPath);
  };

  const unreadMessagesCount = messages.filter((m) => !m.is_read).length;

  // Determine view rendering
  const isAdminRoute = currentPath.startsWith('/admin');

  if (configLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center font-mono text-xs text-blue-400 space-y-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 animate-spin flex items-center justify-center">
          <div className="w-4 h-4 rounded-lg bg-blue-500" />
        </div>
        <p>Connecting to Supabase...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center font-mono text-xs text-blue-400 space-y-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 animate-spin flex items-center justify-center">
          <div className="w-4 h-4 rounded-lg bg-blue-500" />
        </div>
        <p>Loading Mostafa Portfolio...</p>
      </div>
    );
  }

  // Admin Routes Rendering
  if (isAdminRoute) {
    if (authChecking) {
      return (
        <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center font-mono text-xs text-blue-400 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 animate-spin flex items-center justify-center">
            <div className="w-4 h-4 rounded-lg bg-blue-500" />
          </div>
          <p>Verifying Administrator Session...</p>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <AdminLoginPage
          onLoginSuccess={handleLoginSuccess}
          onNavigatePublic={() => navigate('/')}
        />
      );
    }

    let adminComponent = (
      <AdminDashboardPage
        onNavigate={navigate}
        stats={{
          projectsCount: projects.length,
          certificatesCount: certificates.length,
          skillsCount: skills.length,
          messagesCount: messages.length,
          unreadMessagesCount: unreadMessagesCount,
          reviewsCount: reviews.length,
          socialLinksCount: socialLinks.length,
        }}
      />
    );

    if (currentPath === '/admin/profile') {
      adminComponent = <AdminProfilePage profile={profile} onRefresh={loadAllData} />;
    } else if (currentPath === '/admin/about') {
      adminComponent = <AdminAboutPage about={about} onRefresh={loadAllData} />;
    } else if (currentPath === '/admin/skills') {
      adminComponent = <AdminSkillsPage skills={skills || []} onRefresh={loadAllData} />;
    } else if (currentPath === '/admin/projects') {
      adminComponent = <AdminProjectsPage projects={projects || []} onRefresh={loadAllData} />;
    } else if (currentPath === '/admin/certificates') {
      adminComponent = <AdminCertificatesPage certificates={certificates || []} onRefresh={loadAllData} />;
    } else if (currentPath === '/admin/experience') {
      adminComponent = <AdminExperiencePage experiences={experiences || []} onRefresh={loadAllData} />;
    } else if (currentPath === '/admin/education') {
      adminComponent = <AdminEducationPage educations={educations || []} onRefresh={loadAllData} />;
    } else if (currentPath === '/admin/resume') {
      adminComponent = <AdminResumePage resume={resume} onRefresh={loadAllData} />;
    } else if (currentPath === '/admin/reviews') {
      adminComponent = <AdminReviewsPage reviews={reviews || []} onRefresh={loadAllData} />;
    } else if (currentPath === '/admin/social-links') {
      adminComponent = <AdminSocialLinksPage socialLinks={socialLinks || []} onRefresh={loadAllData} />;
    } else if (currentPath === '/admin/messages') {
      adminComponent = <AdminMessagesPage messages={messages || []} onRefresh={loadAllData} />;
    } else if (currentPath === '/admin/media') {
      adminComponent = <AdminMediaPage />;
    } else if (currentPath === '/admin/settings') {
      adminComponent = <AdminSettingsPage onRefresh={loadAllData} />;
    }

    return (
      <AdminLayout
        currentPath={currentPath}
        onNavigate={navigate}
        onLogout={handleLogout}
        unreadMessagesCount={unreadMessagesCount}
      >
        <ErrorBoundary fallbackTitle="Admin Section Unavailable">
          {adminComponent}
        </ErrorBoundary>
      </AdminLayout>
    );
  }

  // Public Routes Rendering
  let publicComponent: React.ReactNode;

  if (currentPath === '/') {
    publicComponent = (
      <HomePage
        onNavigate={navigate}
        profile={profile}
        about={about}
        skills={skills}
        projects={projects}
        certificates={certificates}
        reviews={reviews}
        resume={resume}
        socialLinks={socialLinks}
      />
    );
  } else if (currentPath === '/about') {
    publicComponent = (
      <AboutPage
        onNavigate={navigate}
        about={about}
        profile={profile}
      />
    );
  } else if (currentPath === '/skills') {
    publicComponent = <SkillsPage skills={skills} onNavigate={navigate} />;
  } else if (currentPath === '/projects') {
    publicComponent = <ProjectsPage projects={projects} onNavigate={navigate} />;
  } else if (currentPath.startsWith('/projects/')) {
    const slug = currentPath.replace('/projects/', '');
    publicComponent = (
      <ProjectDetailPage
        slug={slug}
        onNavigate={navigate}
        allProjects={projects}
      />
    );
  } else if (currentPath === '/certificates') {
    publicComponent = <CertificatesPage certificates={certificates} onNavigate={navigate} />;
  } else if (currentPath === '/experience') {
    publicComponent = <ExperiencePage experiences={experiences} onNavigate={navigate} />;
  } else if (currentPath === '/education') {
    publicComponent = <EducationPage educations={educations} onNavigate={navigate} />;
  } else if (currentPath === '/resume') {
    publicComponent = <ResumePage resume={resume} profile={profile} onNavigate={navigate} />;
  } else if (currentPath === '/reviews') {
    publicComponent = <ReviewsPage reviews={reviews} onNavigate={navigate} />;
  } else if (currentPath === '/contact') {
    publicComponent = (
      <ContactPage
        profile={profile}
        socialLinks={socialLinks}
        onMessageSent={loadAllData}
      />
    );
  } else {
    publicComponent = <NotFoundPage currentPath={currentPath} onNavigate={navigate} />;
  }

  return (
    <PublicLayout
      currentPath={currentPath}
      onNavigate={navigate}
      profile={profile}
      socialLinks={socialLinks}
    >
      {publicComponent}
    </PublicLayout>
  );
}
