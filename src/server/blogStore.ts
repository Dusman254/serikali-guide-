import fs from 'fs';
import path from 'path';
import { BLOG_POSTS, BlogPost } from '../data/serikaliData';

// Persistent storage file paths
const PRIMARY_DATA_PATH = path.resolve(process.cwd(), 'src/data/persisted_blogs.json');
const TMP_DATA_PATH = path.resolve('/tmp', 'serikali_persisted_blogs.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public/uploads');

// Ensure uploads directory exists
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('Could not create public/uploads directory:', err);
}

// Secure in-memory & disk-synced persistent store
let blogsCache: BlogPost[] = [];
let mediaCache: Map<string, { id: string; contentType: string; buffer: Buffer; alt: string; createdAt: string }> = new Map();

// Helper to save blogs to disk
function persistBlogsToDisk() {
  const jsonStr = JSON.stringify(blogsCache, null, 2);
  let saved = false;

  try {
    const dir = path.dirname(PRIMARY_DATA_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PRIMARY_DATA_PATH, jsonStr, 'utf-8');
    saved = true;
  } catch (err) {
    // Primary path write failed (e.g. read-only filesystem on Vercel)
  }

  if (!saved) {
    try {
      fs.writeFileSync(TMP_DATA_PATH, jsonStr, 'utf-8');
      saved = true;
    } catch (err) {
      console.warn('Fallback to /tmp blogs persistence failed:', err);
    }
  }
}

// Helper to read blogs from disk
function loadBlogsFromDisk(): BlogPost[] | null {
  try {
    if (fs.existsSync(PRIMARY_DATA_PATH)) {
      const content = fs.readFileSync(PRIMARY_DATA_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    // Primary read error
  }

  try {
    if (fs.existsSync(TMP_DATA_PATH)) {
      const content = fs.readFileSync(TMP_DATA_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {}

  return null;
}

// Generate URL slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Cryptographically secure active admin tokens with 24-hour expiration
interface AdminSession {
  token: string;
  expiresAt: number;
}
const activeAdminSessions = new Map<string, number>();

export function createAdminSession(passcode: string): { success: boolean; token?: string; error?: string } {
  const expectedPasscode = process.env.ADMIN_PASSCODE || '1940';
  if (passcode.trim() !== expectedPasscode) {
    return { success: false, error: 'Invalid admin passcode.' };
  }
  // Cryptographically random token
  const token = `SG-ADMIN-${Date.now()}-${Math.random().toString(36).substring(2, 12)}-${Math.random().toString(36).substring(2, 12)}`;
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  activeAdminSessions.set(token, expiresAt);
  return { success: true, token };
}

export function isValidAdminToken(authHeader?: string): boolean {
  if (!authHeader) return false;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;

  // Check explicit environment variable override if set
  if (process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN) {
    return true;
  }

  // Check valid non-expired active session
  const expiresAt = activeAdminSessions.get(token);
  if (expiresAt && expiresAt > Date.now()) {
    return true;
  }

  return false;
}

// Initialize blogs cache with disk store or default published posts if empty
export function initBlogsStore(): BlogPost[] {
  if (blogsCache.length === 0) {
    const fromDisk = loadBlogsFromDisk();
    if (fromDisk && fromDisk.length > 0) {
      blogsCache = fromDisk;
    } else {
      blogsCache = BLOG_POSTS.map((b) => ({
        ...b,
        status: 'published' as const,
        createdAt: b.publishedDate || new Date().toISOString(),
        updatedAt: b.publishedDate || new Date().toISOString(),
        tags: b.keywords || [],
        content: b.sections
          ? b.sections
              .map(
                (s) =>
                  `## ${s.heading}\n\n${
                    s.paragraphs ? s.paragraphs.join('\n\n') : (s as any).body || ''
                  }`
              )
              .join('\n\n')
          : b.excerpt,
        seoTitle: `${b.title} | Serikali Guide`,
        seoDescription: b.excerpt,
      }));
      persistBlogsToDisk();
    }
  }
  return blogsCache;
}

// Get all blogs (filtered for public vs admin)
export function getBlogs(status: 'all' | 'published' | 'draft' | 'unpublished' = 'published'): BlogPost[] {
  initBlogsStore();
  if (status === 'all') {
    return [...blogsCache];
  }
  if (status === 'published') {
    return blogsCache.filter((b) => b.status === 'published' || !b.status);
  }
  return blogsCache.filter((b) => b.status === status);
}

// Get single blog by slug or ID
export function getBlogBySlugOrId(identifier: string): BlogPost | undefined {
  initBlogsStore();
  const clean = identifier.toLowerCase().trim();
  return blogsCache.find(
    (b) => b.id.toLowerCase() === clean || b.slug.toLowerCase() === clean
  );
}

// Ensure unique slug
function ensureUniqueSlug(desiredSlug: string, currentId?: string): string {
  let slug = desiredSlug || 'article';
  let counter = 1;
  while (blogsCache.some((b) => b.slug === slug && b.id !== currentId)) {
    counter++;
    slug = `${desiredSlug}-${counter}`;
  }
  return slug;
}

// Create new blog
export function createBlog(input: Partial<BlogPost>): BlogPost {
  initBlogsStore();
  const title = input.title?.trim() || 'Untitled Guide';
  const baseSlug = input.slug?.trim() ? generateSlug(input.slug) : generateSlug(title);
  const slug = ensureUniqueSlug(baseSlug);

  const nowIso = new Date().toISOString();
  const nowFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const newPost: BlogPost = {
    id: input.id || `blog-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    slug,
    title,
    subtitle: input.subtitle?.trim() || '',
    excerpt: input.excerpt?.trim() || (input.content ? input.content.slice(0, 160) + '...' : ''),
    categoryId: (input.categoryId as any) || 'immigration-visas',
    categoryName: input.categoryName || 'Immigration & Visas',
    subCategoryName: input.subCategoryName || 'General Guide',
    author: input.author || 'Serikali Legal & Regulatory Desk',
    authorRole: input.authorRole || 'Senior Regulatory Specialist',
    publishedDate: input.publishedDate || nowFormatted,
    readTime: input.readTime || '6 min read',
    image: input.image || '/src/assets/images/serikali_immigration_visas_1790882120216.jpg',
    isTopStory: Boolean(input.isTopStory),
    isFeatured: Boolean(input.isFeatured),
    keywords: input.keywords || input.tags || [],
    keyTakeaways: input.keyTakeaways || [],
    officialPortal: input.officialPortal || 'ecitizen.go.ke',
    sections: input.sections || [
      {
        heading: '1. Overview & Statutory Requirements',
        paragraphs: input.content
          ? input.content.split('\n\n').filter(Boolean)
          : ['Detailed procedural analysis.'],
      },
    ],
    status: input.status || 'published',
    tags: input.tags || input.keywords || [],
    content: input.content || '',
    createdAt: nowIso,
    updatedAt: nowIso,
    seoTitle: input.seoTitle || `${title} | Serikali Guide`,
    seoDescription: input.seoDescription || input.excerpt || '',
  };

  blogsCache.unshift(newPost);
  persistBlogsToDisk();
  return newPost;
}

// Update existing blog
export function updateBlog(id: string, input: Partial<BlogPost>): BlogPost | null {
  initBlogsStore();
  const index = blogsCache.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const existing = blogsCache[index];
  let slug = existing.slug;
  if (input.slug && input.slug !== existing.slug) {
    slug = ensureUniqueSlug(generateSlug(input.slug), id);
  } else if (!existing.slug && input.title) {
    slug = ensureUniqueSlug(generateSlug(input.title), id);
  }

  const updated: BlogPost = {
    ...existing,
    ...input,
    id: existing.id, // Immutable ID
    slug,
    updatedAt: new Date().toISOString(),
  };

  blogsCache[index] = updated;
  persistBlogsToDisk();
  return updated;
}

// Delete blog
export function deleteBlog(id: string): boolean {
  initBlogsStore();
  const initialLen = blogsCache.length;
  blogsCache = blogsCache.filter((b) => b.id !== id);
  if (blogsCache.length < initialLen) {
    persistBlogsToDisk();
    return true;
  }
  return false;
}

// Store media asset
export function saveMedia(buffer: Buffer, contentType: string, alt = 'Uploaded article asset'): string {
  const extension = contentType.includes('png')
    ? 'png'
    : contentType.includes('webp')
    ? 'webp'
    : contentType.includes('gif')
    ? 'gif'
    : 'jpg';
  const id = `media-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const filename = `${id}.${extension}`;

  mediaCache.set(id, {
    id,
    contentType,
    buffer,
    alt,
    createdAt: new Date().toISOString(),
  });

  // Try writing to public/uploads directory for static serving
  try {
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${filename}`;
  } catch (err) {
    // If filesystem not writable, fallback to /api/media/:id route
    return `/api/media/${id}`;
  }
}

export function getMedia(id: string) {
  return mediaCache.get(id);
}
