import { BLOG_POSTS, BlogPost } from '../data/serikaliData';

const SYNCED_BLOGS_CACHE_KEY = 'serikali_blogs_synced_v2';
const ADMIN_TOKEN_KEY = 'serikali_admin_token_v1';

export function getStoredAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setStoredAdminToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

export const blogDbService = {
  // Fetch blogs from persistent API (defaults to published for public, all for admin)
  async fetchBlogs(status: 'published' | 'all' = 'published'): Promise<BlogPost[]> {
    try {
      const token = getStoredAdminToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/blogs?status=${status}`, { headers });
      if (res.ok) {
        const blogs: BlogPost[] = await res.json();
        if (Array.isArray(blogs) && blogs.length > 0) {
          try {
            localStorage.setItem(SYNCED_BLOGS_CACHE_KEY, JSON.stringify(blogs));
          } catch {}
          return blogs;
        }
      }
    } catch (err) {
      console.warn('Network fetch for blogs failed, falling back to local cache:', err);
    }

    // Fallback to local storage or bundled defaults
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(SYNCED_BLOGS_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return status === 'published'
              ? parsed.filter((b) => b.status === 'published' || !b.status)
              : parsed;
          }
        }
      } catch {}
    }

    return BLOG_POSTS.map((b) => ({
      ...b,
      status: 'published',
      createdAt: b.publishedDate,
      updatedAt: b.publishedDate,
    }));
  },

  // Fetch individual blog by slug or ID
  async fetchBlog(slugOrId: string): Promise<BlogPost | null> {
    try {
      const token = getStoredAdminToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/blogs/${encodeURIComponent(slugOrId)}`, { headers });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Network fetch for single blog failed:', err);
    }

    // Fallback: check cached blogs
    const cached = await this.fetchBlogs('all');
    const clean = slugOrId.toLowerCase().trim();
    return (
      cached.find(
        (b) => b.id.toLowerCase() === clean || b.slug.toLowerCase() === clean
      ) || null
    );
  },

  // Create blog post (persisted to database)
  async createBlog(blog: Partial<BlogPost>): Promise<BlogPost> {
    const token = getStoredAdminToken();
    const res = await fetch('/api/blogs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(blog),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create blog' }));
      throw new Error(err.error || `Server error ${res.status}`);
    }

    const created: BlogPost = await res.json();

    // Update local cache
    try {
      const cached = await this.fetchBlogs('all');
      const updated = [created, ...cached.filter((b) => b.id !== created.id)];
      localStorage.setItem(SYNCED_BLOGS_CACHE_KEY, JSON.stringify(updated));
    } catch {}

    return created;
  },

  // Update blog post
  async updateBlog(id: string, blog: Partial<BlogPost>): Promise<BlogPost> {
    const token = getStoredAdminToken();
    const res = await fetch(`/api/blogs/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(blog),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update blog' }));
      throw new Error(err.error || `Server error ${res.status}`);
    }

    const updated: BlogPost = await res.json();

    // Update local cache
    try {
      const cached = await this.fetchBlogs('all');
      const next = cached.map((b) => (b.id === id ? updated : b));
      localStorage.setItem(SYNCED_BLOGS_CACHE_KEY, JSON.stringify(next));
    } catch {}

    return updated;
  },

  // Delete blog post
  async deleteBlog(id: string): Promise<boolean> {
    const token = getStoredAdminToken();
    const res = await fetch(`/api/blogs/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to delete blog' }));
      throw new Error(err.error || `Server error ${res.status}`);
    }

    // Update local cache
    try {
      const cached = await this.fetchBlogs('all');
      const next = cached.filter((b) => b.id !== id);
      localStorage.setItem(SYNCED_BLOGS_CACHE_KEY, JSON.stringify(next));
    } catch {}

    return true;
  },

  // Upload blog image (converts file to base64, uploads to persistent media store)
  async uploadImage(file: File): Promise<{ url: string; size: number }> {
    const token = getStoredAdminToken();

    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const res = await fetch('/api/upload/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        data: base64,
        contentType: file.type || 'image/jpeg',
        alt: file.name,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Image upload failed' }));
      throw new Error(err.error || `Server error ${res.status}`);
    }

    return await res.json();
  },

  // Login admin on server
  async adminLogin(passcode: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setStoredAdminToken(data.token);
        return data;
      }
      return { success: false, error: data.error || 'Invalid admin passcode.' };
    } catch (err: any) {
      // Local fallback for offline mode
      if (passcode.trim() === '1940') {
        const token = `SG-ADMIN-LOCAL-${Date.now()}`;
        setStoredAdminToken(token);
        return { success: true, token };
      }
      return { success: false, error: err.message || 'Login failed.' };
    }
  },

  // Logout admin
  adminLogout(): void {
    setStoredAdminToken(null);
  },
};
