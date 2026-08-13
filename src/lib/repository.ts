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
  SiteSettings,
  MediaItem,
} from '../types/portfolio';
import { supabase, isSupabaseConfigured, initializeSupabase, supabaseUrl } from './supabase';

const STORAGE_KEYS = {
  PROFILE: 'mostafa_portfolio_profile_v1',
  ABOUT: 'mostafa_portfolio_about_v1',
  SKILLS: 'mostafa_portfolio_skills_v1',
  PROJECTS: 'mostafa_portfolio_projects_v1',
  CERTIFICATES: 'mostafa_portfolio_certificates_v1',
  EXPERIENCE: 'mostafa_portfolio_experience_v1',
  EDUCATION: 'mostafa_portfolio_education_v1',
  REVIEWS: 'mostafa_portfolio_reviews_v1',
  SOCIAL_LINKS: 'mostafa_portfolio_social_links_v1',
  RESUME: 'mostafa_portfolio_resume_v1',
  MESSAGES: 'mostafa_portfolio_messages_v1',
  SETTINGS: 'mostafa_portfolio_settings_v1',
  MEDIA: 'mostafa_portfolio_media_v1',
};

// Helper for localStorage
function getLocalItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`Error reading localStorage key "${key}"`, e);
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing to localStorage key "${key}"`, e);
  }
}

// --------------------------------------------------
// SERVER API HELPERS (Secure Admin Operations & Fallback Reads)
// --------------------------------------------------
async function apiFetchData<T>(table: string): Promise<T[] | null> {
  try {
    const activeClient = (await initializeSupabase()) || supabase;
    const sessionRes = await activeClient?.auth.getSession().catch(() => null);
    const token = sessionRes?.data?.session?.access_token || '';

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`/api/data/${table}`, { headers });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data as T[];
      }
    }
  } catch (e) {
    console.warn(`[apiFetchData Warning] Table: ${table}`, e);
  }
  return null;
}

async function apiAdminSave<T>(table: string, item: any): Promise<T> {
  const activeClient = (await initializeSupabase()) || supabase;
  const sessionRes = await activeClient?.auth.getSession().catch(() => null);
  const token = sessionRes?.data?.session?.access_token || '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/admin/save', {
    method: 'POST',
    headers,
    body: JSON.stringify({ table, item }),
  });

  const resText = await res.text();
  let data: any = {};
  try {
    data = JSON.parse(resText);
  } catch {
    throw new Error(`Server returned non-JSON response (HTTP ${res.status}): ${resText.substring(0, 100)}`);
  }

  if (!res.ok || !data.success || !data.data) {
    throw new Error(data.error || `Save failed with HTTP ${res.status}`);
  }

  return data.data as T;
}

async function apiAdminDelete(table: string, id: string): Promise<void> {
  const activeClient = (await initializeSupabase()) || supabase;
  const sessionRes = await activeClient?.auth.getSession().catch(() => null);
  const token = sessionRes?.data?.session?.access_token || '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/admin/delete', {
    method: 'POST',
    headers,
    body: JSON.stringify({ table, id }),
  });

  const resText = await res.text();
  let data: any = {};
  try {
    data = JSON.parse(resText);
  } catch {
    throw new Error(`Server returned non-JSON response (HTTP ${res.status}): ${resText.substring(0, 100)}`);
  }

  if (!res.ok || !data.success) {
    throw new Error(data.error || `Delete failed with HTTP ${res.status}`);
  }
}

export const repository = {
  // --------------------------------------------------
  // PROFILE
  // --------------------------------------------------
  async getProfile(): Promise<Profile | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('profile').select('*').limit(1).maybeSingle();
        if (!error && data) return data as Profile;
      } catch (err) {
        console.warn('Supabase fetch error, fallback to local', err);
      }
    }
    return getLocalItem<Profile | null>(STORAGE_KEYS.PROFILE, null);
  },

  async updateProfile(profileData: Partial<Profile>): Promise<Profile> {
    const current = (await this.getProfile()) || {
      full_name: '',
      headline: '',
      bio: '',
      location: '',
      avatar_url: '',
      hero_greeting: '',
      hero_cta_work_label: 'View My Work',
      hero_cta_contact_label: 'Contact Me',
    };

    const updated: Profile = {
      ...current,
      ...profileData,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        if (current.id) {
          const { data, error } = await supabase
            .from('profile')
            .update(updated)
            .eq('id', current.id)
            .select()
            .single();
          if (!error && data) return data as Profile;
        } else {
          const { data, error } = await supabase
            .from('profile')
            .insert([updated])
            .select()
            .single();
          if (!error && data) return data as Profile;
        }
      } catch (err) {
        console.warn('Supabase update profile error', err);
      }
    }

    setLocalItem(STORAGE_KEYS.PROFILE, updated);
    return updated;
  },

  // --------------------------------------------------
  // ABOUT
  // --------------------------------------------------
  async getAbout(): Promise<About | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('about').select('*').limit(1).maybeSingle();
        if (!error && data) return data as About;
      } catch (err) {
        console.warn('Supabase fetch error', err);
      }
    }
    return getLocalItem<About | null>(STORAGE_KEYS.ABOUT, null);
  },

  async updateAbout(aboutData: Partial<About>): Promise<About> {
    const current = (await this.getAbout()) || {
      title: '',
      content: '',
      story: '',
      highlights: [],
    };

    const updated: About = {
      ...current,
      ...aboutData,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        if (current.id) {
          const { data, error } = await supabase
            .from('about')
            .update(updated)
            .eq('id', current.id)
            .select()
            .single();
          if (!error && data) return data as About;
        } else {
          const { data, error } = await supabase.from('about').insert([updated]).select().single();
          if (!error && data) return data as About;
        }
      } catch (err) {
        console.warn('Supabase update about error', err);
      }
    }

    setLocalItem(STORAGE_KEYS.ABOUT, updated);
    return updated;
  },

  // --------------------------------------------------
  // SKILLS
  // --------------------------------------------------
  async getSkills(): Promise<Skill[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('skills').select('*').order('display_order', { ascending: true });
        if (!error && data && data.length > 0) return data as Skill[];
      } catch (err) {
        console.warn('Supabase fetch skills error', err);
      }
    }
    const apiData = await apiFetchData<Skill>('skills');
    if (apiData && apiData.length > 0) {
      setLocalItem(STORAGE_KEYS.SKILLS, apiData);
      return apiData;
    }
    return getLocalItem<Skill[]>(STORAGE_KEYS.SKILLS, []);
  },

  async saveSkill(skillData: Omit<Skill, 'id'> & { id?: string }): Promise<Skill> {
    const skills = await this.getSkills();
    const id = skillData.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const skillItem: Skill = {
      id,
      name: skillData.name,
      category: skillData.category || 'General',
      level: Number(skillData.level) || 80,
      icon: skillData.icon || 'Code',
      featured: Boolean(skillData.featured),
      display_order: Number(skillData.display_order) || 0,
      created_at: skillData.id ? undefined : now,
      updated_at: now,
    };

    let result: Skill | null = null;
    let lastError: Error | null = null;

    try {
      result = await apiAdminSave<Skill>('skills', skillItem);
    } catch (err: any) {
      lastError = err;
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase.from('skills').upsert(skillItem).select().single();
          if (!error && data) result = data as Skill;
          else if (error) lastError = new Error(error.message);
        } catch (e: any) {
          lastError = e;
        }
      }
    }

    if (!result && lastError) {
      throw lastError;
    }

    const savedItem = result || skillItem;
    const index = skills.findIndex((s) => s.id === id);
    if (index >= 0) {
      skills[index] = { ...skills[index], ...savedItem };
    } else {
      skills.push(savedItem);
    }
    setLocalItem(STORAGE_KEYS.SKILLS, skills);
    return savedItem;
  },

  async deleteSkill(id: string): Promise<void> {
    let lastError: Error | null = null;
    let deletedSuccess = false;

    try {
      await apiAdminDelete('skills', id);
      deletedSuccess = true;
    } catch (err: any) {
      lastError = err;
      const activeClient = (await initializeSupabase()) || supabase;
      if (isSupabaseConfigured() && activeClient) {
        try {
          const { error } = await activeClient.from('skills').delete().eq('id', id);
          if (!error) {
            deletedSuccess = true;
          } else {
            lastError = new Error(`Delete failed: ${error.message} (${error.code})`);
          }
        } catch (e: any) {
          lastError = e;
        }
      }
    }

    if (!deletedSuccess && lastError) {
      throw lastError;
    }

    const skills = getLocalItem<Skill[]>(STORAGE_KEYS.SKILLS, []).filter((s) => s.id !== id);
    setLocalItem(STORAGE_KEYS.SKILLS, skills);
  },

  // --------------------------------------------------
  // PROJECTS
  // --------------------------------------------------
  async getProjects(onlyPublished = false): Promise<Project[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('projects').select('*').order('display_order', { ascending: true });
        if (onlyPublished) {
          query = query.eq('published', true);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as Project[];
      } catch (err) {
        console.warn('Supabase fetch projects error', err);
      }
    }
    const apiData = await apiFetchData<Project>('projects');
    if (apiData && apiData.length > 0) {
      setLocalItem(STORAGE_KEYS.PROJECTS, apiData);
      return onlyPublished ? apiData.filter((p) => p.published) : apiData;
    }
    const list = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, []);
    return onlyPublished ? list.filter((p) => p.published) : list;
  },

  async getProjectBySlug(slug: string): Promise<Project | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('projects').select('*').eq('slug', slug).maybeSingle();
        if (!error && data) return data as Project;
      } catch (err) {
        console.warn('Supabase fetch project by slug error', err);
      }
    }
    const projects = await this.getProjects();
    return projects.find((p) => p.slug === slug) || null;
  },

  async saveProject(projectData: Omit<Project, 'id'> & { id?: string }): Promise<Project> {
    const projects = await this.getProjects(false);
    const id = projectData.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const item: Project = {
      id,
      title: projectData.title,
      slug: projectData.slug || projectData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      summary: projectData.summary || '',
      content: projectData.content || '',
      category: projectData.category || 'Web',
      tags: projectData.tags || [],
      cover_image: projectData.cover_image || '',
      gallery: projectData.gallery || [],
      demo_url: projectData.demo_url || '',
      github_url: projectData.github_url || '',
      featured: Boolean(projectData.featured),
      published: Boolean(projectData.published),
      display_order: Number(projectData.display_order) || 0,
      created_at: projectData.id ? undefined : now,
      updated_at: now,
    };

    let result: Project | null = null;
    let lastError: Error | null = null;

    try {
      result = await apiAdminSave<Project>('projects', item);
    } catch (err: any) {
      lastError = err;
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase.from('projects').upsert(item).select().single();
          if (!error && data) result = data as Project;
          else if (error) lastError = new Error(error.message);
        } catch (e: any) {
          lastError = e;
        }
      }
    }

    if (!result && lastError) {
      throw lastError;
    }

    const savedItem = result || item;
    const idx = projects.findIndex((p) => p.id === id);
    if (idx >= 0) {
      projects[idx] = { ...projects[idx], ...savedItem };
    } else {
      projects.push(savedItem);
    }
    setLocalItem(STORAGE_KEYS.PROJECTS, projects);
    return savedItem;
  },

  async deleteProject(id: string): Promise<void> {
    let lastError: Error | null = null;
    let deletedSuccess = false;

    try {
      await apiAdminDelete('projects', id);
      deletedSuccess = true;
    } catch (err: any) {
      lastError = err;
      const activeClient = (await initializeSupabase()) || supabase;
      if (isSupabaseConfigured() && activeClient) {
        try {
          const { error } = await activeClient.from('projects').delete().eq('id', id);
          if (!error) {
            deletedSuccess = true;
          } else {
            lastError = new Error(`Delete failed: ${error.message} (${error.code})`);
          }
        } catch (e: any) {
          lastError = e;
        }
      }
    }

    if (!deletedSuccess && lastError) {
      throw lastError;
    }
    const projects = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, []).filter((p) => p.id !== id);
    setLocalItem(STORAGE_KEYS.PROJECTS, projects);
  },

  // --------------------------------------------------
  // CERTIFICATES
  // --------------------------------------------------
  async getCertificates(): Promise<Certificate[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('certificates').select('*').order('display_order', { ascending: true });
        if (!error && data && data.length > 0) return data as Certificate[];
      } catch (err) {
        console.warn('Supabase fetch certificates error', err);
      }
    }
    const apiData = await apiFetchData<Certificate>('certificates');
    if (apiData && apiData.length > 0) {
      setLocalItem(STORAGE_KEYS.CERTIFICATES, apiData);
      return apiData;
    }
    return getLocalItem<Certificate[]>(STORAGE_KEYS.CERTIFICATES, []);
  },

  async saveCertificate(certData: Omit<Certificate, 'id'> & { id?: string }): Promise<Certificate> {
    const list = await this.getCertificates();
    const id = certData.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const item: Certificate = {
      id,
      title: certData.title,
      issuer: certData.issuer,
      issue_date: certData.issue_date,
      expiry_date: certData.expiry_date || '',
      credential_id: certData.credential_id || '',
      credential_url: certData.credential_url || '',
      image_url: certData.image_url || '',
      pdf_url: certData.pdf_url || '',
      display_order: Number(certData.display_order) || 0,
      created_at: certData.id ? undefined : now,
      updated_at: now,
    };

    let result: Certificate | null = null;
    let lastError: Error | null = null;

    try {
      result = await apiAdminSave<Certificate>('certificates', item);
    } catch (err: any) {
      lastError = err;
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase.from('certificates').upsert(item).select().single();
          if (!error && data) result = data as Certificate;
          else if (error) lastError = new Error(error.message);
        } catch (e: any) {
          lastError = e;
        }
      }
    }

    if (!result && lastError) {
      throw lastError;
    }

    const savedItem = result || item;
    const idx = list.findIndex((c) => c.id === id);
    if (idx >= 0) list[idx] = { ...list[idx], ...savedItem };
    else list.push(savedItem);
    setLocalItem(STORAGE_KEYS.CERTIFICATES, list);
    return savedItem;
  },

  async deleteCertificate(id: string): Promise<void> {
    let lastError: Error | null = null;
    let deletedSuccess = false;

    try {
      await apiAdminDelete('certificates', id);
      deletedSuccess = true;
    } catch (err: any) {
      lastError = err;
      const activeClient = (await initializeSupabase()) || supabase;
      if (isSupabaseConfigured() && activeClient) {
        try {
          const { error } = await activeClient.from('certificates').delete().eq('id', id);
          if (!error) {
            deletedSuccess = true;
          } else {
            lastError = new Error(`Delete failed: ${error.message} (${error.code})`);
          }
        } catch (e: any) {
          lastError = e;
        }
      }
    }

    if (!deletedSuccess && lastError) {
      throw lastError;
    }
    const list = getLocalItem<Certificate[]>(STORAGE_KEYS.CERTIFICATES, []).filter((c) => c.id !== id);
    setLocalItem(STORAGE_KEYS.CERTIFICATES, list);
  },

  // --------------------------------------------------
  // EXPERIENCE
  // --------------------------------------------------
  async getExperiences(): Promise<Experience[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('experience').select('*').order('display_order', { ascending: true });
        if (!error && data && data.length > 0) return data as Experience[];
      } catch (err) {
        console.warn('Supabase fetch experience error', err);
      }
    }
    const apiData = await apiFetchData<Experience>('experience');
    if (apiData && apiData.length > 0) {
      setLocalItem(STORAGE_KEYS.EXPERIENCE, apiData);
      return apiData;
    }
    return getLocalItem<Experience[]>(STORAGE_KEYS.EXPERIENCE, []);
  },

  async saveExperience(expData: Omit<Experience, 'id'> & { id?: string }): Promise<Experience> {
    const list = await this.getExperiences();
    const id = expData.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const item: Experience = {
      id,
      company: expData.company,
      position: expData.position,
      location: expData.location || '',
      start_date: expData.start_date,
      end_date: expData.end_date || '',
      is_current: Boolean(expData.is_current),
      description: expData.description || [],
      skills_used: expData.skills_used || [],
      display_order: Number(expData.display_order) || 0,
      created_at: expData.id ? undefined : now,
      updated_at: now,
    };

    let result: Experience | null = null;
    let lastError: Error | null = null;

    try {
      result = await apiAdminSave<Experience>('experience', item);
    } catch (err: any) {
      lastError = err;
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase.from('experience').upsert(item).select().single();
          if (!error && data) result = data as Experience;
          else if (error) lastError = new Error(error.message);
        } catch (e: any) {
          lastError = e;
        }
      }
    }

    if (!result && lastError) {
      throw lastError;
    }

    const savedItem = result || item;
    const idx = list.findIndex((e) => e.id === id);
    if (idx >= 0) list[idx] = { ...list[idx], ...savedItem };
    else list.push(savedItem);
    setLocalItem(STORAGE_KEYS.EXPERIENCE, list);
    return savedItem;
  },

  async deleteExperience(id: string): Promise<void> {
    let lastError: Error | null = null;
    let deletedSuccess = false;

    try {
      await apiAdminDelete('experience', id);
      deletedSuccess = true;
    } catch (err: any) {
      lastError = err;
      const activeClient = (await initializeSupabase()) || supabase;
      if (isSupabaseConfigured() && activeClient) {
        try {
          const { error } = await activeClient.from('experience').delete().eq('id', id);
          if (!error) {
            deletedSuccess = true;
          } else {
            lastError = new Error(`Delete failed: ${error.message} (${error.code})`);
          }
        } catch (e: any) {
          lastError = e;
        }
      }
    }

    if (!deletedSuccess && lastError) {
      throw lastError;
    }
    const list = getLocalItem<Experience[]>(STORAGE_KEYS.EXPERIENCE, []).filter((e) => e.id !== id);
    setLocalItem(STORAGE_KEYS.EXPERIENCE, list);
  },

  // --------------------------------------------------
  // EDUCATION
  // --------------------------------------------------
  async getEducations(): Promise<Education[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('education').select('*').order('display_order', { ascending: true });
        if (!error && data && data.length > 0) return data as Education[];
      } catch (err) {
        console.warn('Supabase fetch education error', err);
      }
    }
    const apiData = await apiFetchData<Education>('education');
    if (apiData && apiData.length > 0) {
      setLocalItem(STORAGE_KEYS.EDUCATION, apiData);
      return apiData;
    }
    return getLocalItem<Education[]>(STORAGE_KEYS.EDUCATION, []);
  },

  async saveEducation(eduData: Omit<Education, 'id'> & { id?: string }): Promise<Education> {
    const list = await this.getEducations();
    const id = eduData.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const item: Education = {
      id,
      institution: eduData.institution,
      degree: eduData.degree,
      field_of_study: eduData.field_of_study || '',
      location: eduData.location || '',
      start_date: eduData.start_date,
      end_date: eduData.end_date || '',
      is_current: Boolean(eduData.is_current),
      grade: eduData.grade || '',
      description: eduData.description || '',
      display_order: Number(eduData.display_order) || 0,
      created_at: eduData.id ? undefined : now,
      updated_at: now,
    };

    let result: Education | null = null;
    let lastError: Error | null = null;

    try {
      result = await apiAdminSave<Education>('education', item);
    } catch (err: any) {
      lastError = err;
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase.from('education').upsert(item).select().single();
          if (!error && data) result = data as Education;
          else if (error) lastError = new Error(error.message);
        } catch (e: any) {
          lastError = e;
        }
      }
    }

    if (!result && lastError) {
      throw lastError;
    }

    const savedItem = result || item;
    const idx = list.findIndex((e) => e.id === id);
    if (idx >= 0) list[idx] = { ...list[idx], ...savedItem };
    else list.push(savedItem);
    setLocalItem(STORAGE_KEYS.EDUCATION, list);
    return savedItem;
  },

  async deleteEducation(id: string): Promise<void> {
    let lastError: Error | null = null;
    let deletedSuccess = false;

    try {
      await apiAdminDelete('education', id);
      deletedSuccess = true;
    } catch (err: any) {
      lastError = err;
      const activeClient = (await initializeSupabase()) || supabase;
      if (isSupabaseConfigured() && activeClient) {
        try {
          const { error } = await activeClient.from('education').delete().eq('id', id);
          if (!error) {
            deletedSuccess = true;
          } else {
            lastError = new Error(`Delete failed: ${error.message} (${error.code})`);
          }
        } catch (e: any) {
          lastError = e;
        }
      }
    }

    if (!deletedSuccess && lastError) {
      throw lastError;
    }
    const list = getLocalItem<Education[]>(STORAGE_KEYS.EDUCATION, []).filter((e) => e.id !== id);
    setLocalItem(STORAGE_KEYS.EDUCATION, list);
  },

  // --------------------------------------------------
  // REVIEWS
  // --------------------------------------------------
  async getReviews(onlyPublished = false): Promise<Review[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('reviews').select('*').order('display_order', { ascending: true });
        if (onlyPublished) query = query.eq('is_published', true);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as Review[];
      } catch (err) {
        console.warn('Supabase fetch reviews error', err);
      }
    }
    const apiData = await apiFetchData<Review>('reviews');
    if (apiData && apiData.length > 0) {
      setLocalItem(STORAGE_KEYS.REVIEWS, apiData);
      return onlyPublished ? apiData.filter((r) => r.is_published) : apiData;
    }
    const list = getLocalItem<Review[]>(STORAGE_KEYS.REVIEWS, []);
    return onlyPublished ? list.filter((r) => r.is_published) : list;
  },

  async saveReview(reviewData: Omit<Review, 'id'> & { id?: string }): Promise<Review> {
    const list = await this.getReviews(false);
    const id = reviewData.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const item: Review = {
      id,
      client_name: reviewData.client_name,
      client_photo: reviewData.client_photo || '',
      company: reviewData.company || '',
      position: reviewData.position || '',
      rating: Number(reviewData.rating) || 5,
      review_text: reviewData.review_text,
      date: reviewData.date || new Date().toISOString().split('T')[0],
      is_published: Boolean(reviewData.is_published),
      display_order: Number(reviewData.display_order) || 0,
      created_at: reviewData.id ? undefined : now,
      updated_at: now,
    };

    let result: Review | null = null;
    let lastError: Error | null = null;

    try {
      result = await apiAdminSave<Review>('reviews', item);
    } catch (err: any) {
      lastError = err;
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase.from('reviews').upsert(item).select().single();
          if (!error && data) result = data as Review;
          else if (error) lastError = new Error(error.message);
        } catch (e: any) {
          lastError = e;
        }
      }
    }

    if (!result && lastError) {
      throw lastError;
    }

    const savedItem = result || item;
    const idx = list.findIndex((r) => r.id === id);
    if (idx >= 0) list[idx] = { ...list[idx], ...savedItem };
    else list.push(savedItem);
    setLocalItem(STORAGE_KEYS.REVIEWS, list);
    return savedItem;
  },

  async deleteReview(id: string): Promise<void> {
    let lastError: Error | null = null;
    let deletedSuccess = false;

    try {
      await apiAdminDelete('reviews', id);
      deletedSuccess = true;
    } catch (err: any) {
      lastError = err;
      const activeClient = (await initializeSupabase()) || supabase;
      if (isSupabaseConfigured() && activeClient) {
        try {
          const { error } = await activeClient.from('reviews').delete().eq('id', id);
          if (!error) {
            deletedSuccess = true;
          } else {
            lastError = new Error(`Delete failed: ${error.message} (${error.code})`);
          }
        } catch (e: any) {
          lastError = e;
        }
      }
    }

    if (!deletedSuccess && lastError) {
      throw lastError;
    }
    const list = getLocalItem<Review[]>(STORAGE_KEYS.REVIEWS, []).filter((r) => r.id !== id);
    setLocalItem(STORAGE_KEYS.REVIEWS, list);
  },

  // --------------------------------------------------
  // SOCIAL LINKS
  // --------------------------------------------------
  async getSocialLinks(onlyEnabled = false): Promise<SocialLink[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('social_links').select('*').order('display_order', { ascending: true });
        if (onlyEnabled) query = query.eq('is_enabled', true);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as SocialLink[];
      } catch (err) {
        console.warn('Supabase fetch social links error', err);
      }
    }
    const apiData = await apiFetchData<SocialLink>('social_links');
    if (apiData && apiData.length > 0) {
      setLocalItem(STORAGE_KEYS.SOCIAL_LINKS, apiData);
      return onlyEnabled ? apiData.filter((s) => s.is_enabled) : apiData;
    }
    const list = getLocalItem<SocialLink[]>(STORAGE_KEYS.SOCIAL_LINKS, []);
    return onlyEnabled ? list.filter((s) => s.is_enabled) : list;
  },

  async saveSocialLink(socialData: Omit<SocialLink, 'id'> & { id?: string }): Promise<SocialLink> {
    const list = await this.getSocialLinks(false);
    const id = socialData.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const item: SocialLink = {
      id,
      platform: socialData.platform,
      label: socialData.label || socialData.platform,
      url: socialData.url,
      icon: socialData.icon || '',
      is_enabled: Boolean(socialData.is_enabled),
      display_order: Number(socialData.display_order) || 0,
      created_at: socialData.id ? undefined : now,
      updated_at: now,
    };

    let result: SocialLink | null = null;
    let lastError: Error | null = null;

    try {
      result = await apiAdminSave<SocialLink>('social_links', item);
    } catch (err: any) {
      lastError = err;
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase.from('social_links').upsert(item).select().single();
          if (!error && data) result = data as SocialLink;
          else if (error) lastError = new Error(error.message);
        } catch (e: any) {
          lastError = e;
        }
      }
    }

    if (!result && lastError) {
      throw lastError;
    }

    const savedItem = result || item;
    const idx = list.findIndex((s) => s.id === id);
    if (idx >= 0) list[idx] = { ...list[idx], ...savedItem };
    else list.push(savedItem);
    setLocalItem(STORAGE_KEYS.SOCIAL_LINKS, list);
    return savedItem;
  },

  async deleteSocialLink(id: string): Promise<void> {
    let lastError: Error | null = null;
    let deletedSuccess = false;

    try {
      await apiAdminDelete('social_links', id);
      deletedSuccess = true;
    } catch (err: any) {
      lastError = err;
      const activeClient = (await initializeSupabase()) || supabase;
      if (isSupabaseConfigured() && activeClient) {
        try {
          const { error } = await activeClient.from('social_links').delete().eq('id', id);
          if (!error) {
            deletedSuccess = true;
          } else {
            lastError = new Error(`Delete failed: ${error.message} (${error.code})`);
          }
        } catch (e: any) {
          lastError = e;
        }
      }
    }

    if (!deletedSuccess && lastError) {
      throw lastError;
    }
    const list = getLocalItem<SocialLink[]>(STORAGE_KEYS.SOCIAL_LINKS, []).filter((s) => s.id !== id);
    setLocalItem(STORAGE_KEYS.SOCIAL_LINKS, list);
  },

  // --------------------------------------------------
  // RESUME
  // --------------------------------------------------
  async getResume(): Promise<Resume | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('resume').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (!error && data) return data as Resume;
      } catch (err) {
        console.warn('Supabase fetch resume error', err);
      }
    }
    const apiData = await apiFetchData<Resume>('resume');
    if (apiData && apiData.length > 0) {
      const active = apiData.find((r) => r.is_active) || apiData[0];
      setLocalItem(STORAGE_KEYS.RESUME, active);
      return active;
    }
    return getLocalItem<Resume | null>(STORAGE_KEYS.RESUME, null);
  },

  async saveResume(resumeData: Partial<Resume>): Promise<Resume> {
    const current = (await this.getResume()) || {
      id: crypto.randomUUID(),
      title: 'Curriculum Vitae',
      file_url: '',
      file_size: '',
      updated_at: new Date().toISOString(),
      is_active: true,
    };

    const updated: Resume = {
      ...current,
      ...resumeData,
      updated_at: new Date().toISOString(),
    };

    let result: Resume | null = null;
    let lastError: Error | null = null;

    try {
      result = await apiAdminSave<Resume>('resume', updated);
    } catch (err: any) {
      lastError = err;
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase.from('resume').upsert(updated).select().single();
          if (!error && data) result = data as Resume;
          else if (error) lastError = new Error(error.message);
        } catch (e: any) {
          lastError = e;
        }
      }
    }

    if (!result && lastError) {
      throw lastError;
    }

    const savedItem = result || updated;
    setLocalItem(STORAGE_KEYS.RESUME, savedItem);
    return savedItem;
  },

  // --------------------------------------------------
  // MESSAGES
  // --------------------------------------------------
  async getMessages(): Promise<ContactMessage[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as ContactMessage[];
      } catch (err) {
        console.warn('Supabase fetch messages error', err);
      }
    }
    const apiData = await apiFetchData<ContactMessage>('messages');
    if (apiData && apiData.length > 0) {
      setLocalItem(STORAGE_KEYS.MESSAGES, apiData);
      return apiData;
    }
    return getLocalItem<ContactMessage[]>(STORAGE_KEYS.MESSAGES, []);
  },

  async sendMessage(msg: Omit<ContactMessage, 'id' | 'created_at' | 'is_read' | 'is_archived'>): Promise<ContactMessage> {
    const list = await this.getMessages();
    const item: ContactMessage = {
      id: crypto.randomUUID(),
      sender_name: msg.sender_name,
      sender_email: msg.sender_email,
      subject: msg.subject || 'Portfolio Inquiry',
      message: msg.message,
      is_read: false,
      is_archived: false,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('messages').insert([item]).select().single();
        if (!error && data) return data as ContactMessage;
      } catch (err) {
        console.warn('Supabase send message error', err);
      }
    }

    list.unshift(item);
    setLocalItem(STORAGE_KEYS.MESSAGES, list);
    return item;
  },

  async markMessageRead(id: string, is_read = true): Promise<void> {
    try {
      await apiAdminSave('messages', { id, is_read });
    } catch {
      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.from('messages').update({ is_read }).eq('id', id);
        } catch (err) {
          console.warn('Supabase mark read error', err);
        }
      }
    }
    const list = await this.getMessages();
    const item = list.find((m) => m.id === id);
    if (item) item.is_read = is_read;
    setLocalItem(STORAGE_KEYS.MESSAGES, list);
  },

  async deleteMessage(id: string): Promise<void> {
    let lastError: Error | null = null;
    let deletedSuccess = false;

    try {
      await apiAdminDelete('messages', id);
      deletedSuccess = true;
    } catch (err: any) {
      lastError = err;
      const activeClient = (await initializeSupabase()) || supabase;
      if (isSupabaseConfigured() && activeClient) {
        try {
          const { error } = await activeClient.from('messages').delete().eq('id', id);
          if (!error) {
            deletedSuccess = true;
          } else {
            lastError = new Error(`Delete failed: ${error.message} (${error.code})`);
          }
        } catch (e: any) {
          lastError = e;
        }
      }
    }

    if (!deletedSuccess && lastError) {
      throw lastError;
    }
    const list = getLocalItem<ContactMessage[]>(STORAGE_KEYS.MESSAGES, []).filter((m) => m.id !== id);
    setLocalItem(STORAGE_KEYS.MESSAGES, list);
  },

  // --------------------------------------------------
  // SITE SETTINGS
  // --------------------------------------------------
  async getSettings(): Promise<SiteSettings> {
    const defaultSettings: SiteSettings = {
      site_title: 'Mostafa Portfolio',
      meta_description: 'Official personal portfolio website',
      keywords: 'portfolio, software engineer, developer, projects',
      og_image_url: '',
      google_analytics_id: '',
      google_search_console_code: '',
      allow_indexing: true,
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
        if (!error && data) return data as SiteSettings;
      } catch (err) {
        console.warn('Supabase fetch settings error', err);
      }
    }
    return getLocalItem<SiteSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);
  },

  async updateSettings(newSettings: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSettings();
    const updated: SiteSettings = {
      ...current,
      ...newSettings,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        if (current.id) {
          const { data, error } = await supabase.from('site_settings').update(updated).eq('id', current.id).select().single();
          if (!error && data) return data as SiteSettings;
        } else {
          const { data, error } = await supabase.from('site_settings').insert([updated]).select().single();
          if (!error && data) return data as SiteSettings;
        }
      } catch (err) {
        console.warn('Supabase update settings error', err);
      }
    }

    setLocalItem(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // --------------------------------------------------
  // MEDIA
  // --------------------------------------------------
  async getMedia(): Promise<MediaItem[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false });
        if (!error && data) return data as MediaItem[];
      } catch (err) {
        console.warn('Supabase fetch media error', err);
      }
    }
    return getLocalItem<MediaItem[]>(STORAGE_KEYS.MEDIA, []);
  },

  async addMedia(item: Omit<MediaItem, 'id' | 'created_at'>): Promise<MediaItem> {
    const list = await this.getMedia();
    const newItem: MediaItem = {
      id: crypto.randomUUID(),
      ...item,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('media').insert([newItem]).select().single();
        if (!error && data) return data as MediaItem;
      } catch (err) {
        console.warn('Supabase add media error', err);
      }
    }

    list.unshift(newItem);
    setLocalItem(STORAGE_KEYS.MEDIA, list);
    return newItem;
  },

  async uploadFile(file: File, bucket = 'media'): Promise<string> {
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error(`File size exceeds limit of 15MB (${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
    }

    console.log(`[Upload Request] File: "${file.name}" (${file.size} bytes, ${file.type || 'unknown type'}), Bucket: "${bucket}"`);

    const client = (await initializeSupabase()) || supabase;
    const sessionRes = await client?.auth.getSession().catch(() => null);
    const token = sessionRes?.data?.session?.access_token || '';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch('/api/upload', {
        method: 'POST',
        headers,
        body: formData,
      });
    } catch (networkErr: any) {
      console.error('[Upload Network Error]', networkErr);
      throw new Error(`Network error while uploading file: ${networkErr.message || 'Server unreachable'}`);
    }

    const responseText = await response.text();
    let data: any = {};
    try {
      data = JSON.parse(responseText);
    } catch {
      const snippet = responseText.length > 150 ? responseText.substring(0, 150) + '...' : responseText;
      throw new Error(`Server returned non-JSON response (HTTP ${response.status}): ${snippet || 'Empty body'}`);
    }

    if (!response.ok || !data.success || !data.url) {
      const errorMsg = data.error || `Upload failed with HTTP status ${response.status}`;
      console.error(`[Upload Failed] ${errorMsg}`, data);
      throw new Error(errorMsg);
    }

    console.log(`[Upload Success] Public URL: "${data.url}", Path: "${data.path}"`);
    return data.url;
  },

  async uploadMediaFile(file: File, bucket = 'media'): Promise<MediaItem> {
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error(`File size exceeds limit of 15MB (${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
    }

    console.log(`[Media Upload Request] File: "${file.name}" (${file.size} bytes), Bucket: "${bucket}"`);

    const client = (await initializeSupabase()) || supabase;
    const sessionRes = await client?.auth.getSession().catch(() => null);
    const token = sessionRes?.data?.session?.access_token || '';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch('/api/upload', {
        method: 'POST',
        headers,
        body: formData,
      });
    } catch (networkErr: any) {
      console.error('[Media Upload Network Error]', networkErr);
      throw new Error(`Network error while uploading file: ${networkErr.message || 'Server unreachable'}`);
    }

    const responseText = await response.text();
    let data: any = {};
    try {
      data = JSON.parse(responseText);
    } catch {
      const snippet = responseText.length > 150 ? responseText.substring(0, 150) + '...' : responseText;
      throw new Error(`Server returned non-JSON response (HTTP ${response.status}): ${snippet || 'Empty body'}`);
    }

    if (!response.ok || !data.success || !data.url) {
      const errorMsg = data.error || `Upload failed with HTTP status ${response.status}`;
      console.error(`[Media Upload Failed] ${errorMsg}`, data);
      throw new Error(errorMsg);
    }

    console.log(`[Media Upload Success] Public URL: "${data.url}", Path: "${data.path}"`);

    const item: Omit<MediaItem, 'id' | 'created_at'> = {
      name: file.name,
      file_path: data.path || '',
      file_url: data.url,
      size: file.size,
      file_type: file.type || 'application/octet-stream',
      storage_bucket: bucket,
    };

    return await this.addMedia(item);
  },

  async deleteStorageFile(bucket: string, filePath: string): Promise<void> {
    if (!bucket || !filePath) return;

    const client = (await initializeSupabase()) || supabase;
    const sessionRes = await client?.auth.getSession().catch(() => null);
    const token = sessionRes?.data?.session?.access_token || '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    await fetch('/api/storage/delete', {
      method: 'POST',
      headers,
      body: JSON.stringify({ bucket, path: filePath }),
    }).catch((err) => console.warn('Failed to delete storage file:', err));
  },

  async deleteMedia(id: string): Promise<void> {
    const activeClient = (await initializeSupabase()) || supabase;
    let fileBucket = '';
    let filePath = '';

    if (isSupabaseConfigured() && activeClient) {
      try {
        const { data: record } = await activeClient.from('media').select('*').eq('id', id).maybeSingle();
        if (record) {
          fileBucket = record.storage_bucket || 'media';
          filePath = record.file_path || '';
        }
      } catch (err) {
        console.warn('Could not fetch media record before delete:', err);
      }
    }

    if (!filePath) {
      const list = getLocalItem<MediaItem[]>(STORAGE_KEYS.MEDIA, []);
      const target = list.find((m) => m.id === id);
      if (target) {
        fileBucket = target.storage_bucket || 'media';
        filePath = target.file_path || '';
      }
    }

    if (filePath && fileBucket) {
      await this.deleteStorageFile(fileBucket, filePath);
    }

    let lastError: Error | null = null;
    let deletedSuccess = false;

    try {
      await apiAdminDelete('media', id);
      deletedSuccess = true;
    } catch (err: any) {
      lastError = err;
      if (isSupabaseConfigured() && activeClient) {
        try {
          const { error } = await activeClient.from('media').delete().eq('id', id);
          if (!error) {
            deletedSuccess = true;
          } else {
            lastError = new Error(`Delete failed: ${error.message} (${error.code})`);
          }
        } catch (e: any) {
          lastError = e;
        }
      }
    }

    if (!deletedSuccess && lastError) {
      throw lastError;
    }

    const list = getLocalItem<MediaItem[]>(STORAGE_KEYS.MEDIA, []);
    const updated = list.filter((m) => m.id !== id);
    setLocalItem(STORAGE_KEYS.MEDIA, updated);
  },
};
