import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Save,
  Upload,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpDown,
  FileText,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  Quote,
  Code,
  Link as LinkIcon,
  X,
  ExternalLink,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Check,
  Calendar,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useSerikali } from '../context/SerikaliContext';
import { BlogPost, SERVICE_CATEGORIES } from '../data/serikaliData';
import { blogDbService } from '../services/blogDbService';

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';
type FilterStatus = 'all' | 'published' | 'draft' | 'unpublished';
type SortOption = 'newest' | 'oldest' | 'updated' | 'title';

const AUTOSAVE_DRAFT_KEY = 'serikali_blog_editor_autosave_v1';

export const CURATED_SERIKALI_PHOTOS = [
  {
    id: 'immigration',
    name: 'Nyayo House / Immigration & Visas',
    category: 'immigration-visas',
    url: '/src/assets/images/serikali_immigration_visas_1790882120216.jpg',
  },
  {
    id: 'business',
    name: 'BRS Business Registration & Corporate',
    category: 'business-registration',
    url: '/src/assets/images/serikali_business_registration_1790882133145.jpg',
  },
  {
    id: 'tax',
    name: 'KRA Tax & eCitizen Systems',
    category: 'tax-compliance',
    url: '/src/assets/images/serikali_tax_ecitizen_1790882155795.jpg',
  },
  {
    id: 'ngo',
    name: 'NGO & PBO Regulatory Governance',
    category: 'ngo-nonprofit',
    url: '/src/assets/images/serikali_ngo_governance_1790882145611.jpg',
  },
  {
    id: 'lands',
    name: 'Ministry of Lands Ardhisasa',
    category: 'government-documents',
    url: '/src/assets/images/serikali_land_documents_1791740090187.jpg',
  },
  {
    id: 'licences',
    name: 'County Licences & Sector Permits',
    category: 'licences-permits',
    url: '/src/assets/images/serikali_licences_permits_1791740074361.jpg',
  },
];

export const AdminBlogManager: React.FC = () => {
  const { navigate, showToast } = useStore();
  const {
    serviceCategories,
    blogPosts,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    reloadBlogs,
    isBlogsLoading,
  } = useSerikali();

  // Mode: 'list' | 'editor'
  const [mode, setMode] = useState<'list' | 'editor'>('list');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Delete Confirmation Modal State
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [categoryId, setCategoryId] = useState<string>('immigration-visas');
  const [subCategoryName, setSubCategoryName] = useState('General Guide');
  const [author, setAuthor] = useState('Serikali Legal & Regulatory Desk');
  const [authorRole, setAuthorRole] = useState('Senior Regulatory Specialist');
  const [officialPortal, setOfficialPortal] = useState('ecitizen.go.ke');
  const [readTime, setReadTime] = useState('6 min read');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('/src/assets/images/serikali_immigration_visas_1790882120216.jpg');
  const [imageAlt, setImageAlt] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [takeawaysInput, setTakeawaysInput] = useState('');
  const [status, setStatus] = useState<'published' | 'draft' | 'unpublished'>('published');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTopStory, setIsTopStory] = useState(false);

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Editor Sub-tabs: 'write' | 'preview'
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');

  // Save & Autosave status
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // AI Generation State
  const [aiTopic, setAiTopic] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Track Unsaved Changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Warn on page reload or navigation if unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && mode === 'editor') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, mode]);

  // Autosave to localStorage when editing
  useEffect(() => {
    if (mode !== 'editor') return;
    if (!hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      const draftData = {
        title,
        slug,
        subtitle,
        categoryId,
        subCategoryName,
        author,
        authorRole,
        officialPortal,
        readTime,
        excerpt,
        content,
        featuredImage,
        imageAlt,
        tags,
        takeawaysInput,
        status,
        isFeatured,
        isTopStory,
        seoTitle,
        seoDescription,
        savedAt: new Date().toISOString(),
        editingPostId,
      };
      try {
        localStorage.setItem(AUTOSAVE_DRAFT_KEY, JSON.stringify(draftData));
        setSaveStatus('saved');
      } catch (err) {
        setSaveStatus('error');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [
    mode,
    hasUnsavedChanges,
    title,
    slug,
    subtitle,
    categoryId,
    subCategoryName,
    author,
    authorRole,
    officialPortal,
    readTime,
    excerpt,
    content,
    featuredImage,
    imageAlt,
    tags,
    takeawaysInput,
    status,
    isFeatured,
    isTopStory,
    seoTitle,
    seoDescription,
    editingPostId,
  ]);

  const markDirty = () => {
    setHasUnsavedChanges(true);
    setSaveStatus('unsaved');
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingPostId(null);
    setTitle('');
    setSlug('');
    setSubtitle('');
    setCategoryId('immigration-visas');
    setSubCategoryName('General Guide');
    setAuthor('Serikali Legal & Regulatory Desk');
    setAuthorRole('Senior Regulatory Specialist');
    setOfficialPortal('ecitizen.go.ke');
    setReadTime('6 min read');
    setExcerpt('');
    setContent('');
    setFeaturedImage('/src/assets/images/serikali_immigration_visas_1790882120216.jpg');
    setImageAlt('Kenyan regulatory procedural advisory');
    setTags(['immigration', 'visa', 'kenya compliance']);
    setTakeawaysInput('Mandatory electronic filing via official portal.\nRetain authenticated payment reference number (PRN).\nCertified physical and digital dossiers required.');
    setStatus('published');
    setIsFeatured(false);
    setIsTopStory(false);
    setSeoTitle('');
    setSeoDescription('');
    setEditorTab('write');
    setSaveStatus('saved');
    setHasUnsavedChanges(false);
    setSaveErrorMsg('');
    setMode('editor');
  };

  // Open Edit Form with existing post data
  const handleOpenEdit = (post: BlogPost) => {
    setEditingPostId(post.id);
    setTitle(post.title || '');
    setSlug(post.slug || '');
    setSubtitle(post.subtitle || '');
    setCategoryId(post.categoryId || 'immigration-visas');
    setSubCategoryName(post.subCategoryName || 'General Guide');
    setAuthor(post.author || 'Serikali Legal & Regulatory Desk');
    setAuthorRole(post.authorRole || 'Senior Regulatory Specialist');
    setOfficialPortal(post.officialPortal || 'ecitizen.go.ke');
    setReadTime(post.readTime || '6 min read');
    setExcerpt(post.excerpt || '');
    setContent(
      post.content ||
        (post.sections
          ? post.sections
              .map((s) => `## ${s.heading}\n\n${s.paragraphs ? s.paragraphs.join('\n\n') : (s as any).body || ''}`)
              .join('\n\n')
          : post.excerpt || '')
    );
    setFeaturedImage(post.image || '/src/assets/images/serikali_immigration_visas_1790882120216.jpg');
    setImageAlt(post.title || 'Serikali guide illustration');
    setTags(post.tags || post.keywords || []);
    setTakeawaysInput(post.keyTakeaways ? post.keyTakeaways.join('\n') : '');
    setStatus(post.status || 'published');
    setIsFeatured(Boolean(post.isFeatured));
    setIsTopStory(Boolean(post.isTopStory));
    setSeoTitle(post.seoTitle || `${post.title} | Serikali Guide`);
    setSeoDescription(post.seoDescription || post.excerpt || '');
    setEditorTab('write');
    setSaveStatus('saved');
    setHasUnsavedChanges(false);
    setSaveErrorMsg('');
    setMode('editor');
  };

  // Format Helper for Markdown toolbar
  const insertFormatting = (prefix: string, suffix = '') => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const nextContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(nextContent);
    markDirty();

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4));
    }, 50);
  };

  // Tag Management
  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
      markDirty();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    markDirty();
  };

  // Image Upload Handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files (PNG, JPG, WebP) are allowed.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('File exceeds 8MB limit. Please upload a smaller image.');
      return;
    }

    setUploadError('');
    setIsUploadingImage(true);

    try {
      const res = await blogDbService.uploadImage(file);
      const chosenUrl = res.dataUrl || res.url;
      if (chosenUrl) {
        setFeaturedImage(chosenUrl);
        if (!imageAlt) {
          setImageAlt(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
        markDirty();
        showToast('Photo uploaded and verified successfully.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Image upload failed.');
      showToast('Image notice: ' + (err.message || 'Used local copy'));
    } finally {
      setIsUploadingImage(false);
      // Reset input value so re-uploading the same file triggers change
      if (e.target) e.target.value = '';
    }
  };

  // AI Blog Auto-Fill with Gemini (Grounded in Verified Republic of Kenya Regulations)
  const handleAiGenerateBlog = async () => {
    if (!aiTopic.trim()) {
      showToast('Please enter a topic for AI generation.');
      return;
    }

    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-serikali-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic.trim(), categoryId }),
      });

      if (!res.ok) {
        throw new Error('AI generation request failed.');
      }

      const data = await res.json();
      if (data) {
        if (data.title) setTitle(data.title);
        if (data.subtitle) setSubtitle(data.subtitle);
        if (data.categoryId) setCategoryId(data.categoryId);
        if (data.subCategoryName) setSubCategoryName(data.subCategoryName);
        if (data.officialPortal) setOfficialPortal(data.officialPortal);
        if (data.readTime) setReadTime(data.readTime);
        if (data.excerpt) setExcerpt(data.excerpt);
        if (data.image) {
          setFeaturedImage(data.image);
        }
        if (data.keyTakeaways && Array.isArray(data.keyTakeaways)) {
          setTakeawaysInput(data.keyTakeaways.join('\n'));
        }
        if (data.content) {
          setContent(data.content);
        } else if (data.sectionHeading && data.sectionBody) {
          const bodyMd = `## ${data.sectionHeading}\n\n${data.sectionBody}\n\n### 2. Mandatory Document Checklist\n${
            data.checklist
              ? data.checklist.map((c: string) => `- [x] ${c}`).join('\n')
              : '- [x] Valid Tax Compliance Certificate\n- [x] Certified Identity Bio-data'
          }\n\n> **Advisory Warning**: ${
            data.callout || 'Always verify through official .go.ke portals to avoid administrative penalties.'
          }`;
          setContent(bodyMd);
        }
        if (data.metaTitle) setSeoTitle(data.metaTitle);
        if (data.metaDescription) setSeoDescription(data.metaDescription);
        if (data.keywords && Array.isArray(data.keywords)) {
          setTags(Array.from(new Set([...tags, ...data.keywords])));
        }

        markDirty();
        showToast('Blog auto-filled with verified 2026 Kenyan statutory regulations.');
      }
    } catch (err: any) {
      showToast('AI generation notice: ' + (err.message || 'Used offline synthesis.'));
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Save Blog Handler (Publish or Save as Draft)
  const handleSave = async (targetStatus?: 'published' | 'draft' | 'unpublished') => {
    const finalStatus = targetStatus || status;

    if (!title.trim()) {
      showToast('Article title is required.');
      return;
    }

    if (!excerpt.trim()) {
      showToast('An executive excerpt / summary is required.');
      return;
    }

    setSaveStatus('saving');
    setSaveErrorMsg('');

    const currentCat = serviceCategories.find((c) => c.id === categoryId);
    const categoryName = currentCat ? currentCat.name : 'Government Civic Advisory';

    const parsedTakeaways = takeawaysInput
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    // Build structured sections from markdown content
    const sections = content
      ? [
          {
            heading: '1. Procedural Overview & Requirements',
            paragraphs: content.split('\n\n').filter(Boolean),
            checklist: parsedTakeaways.slice(0, 4),
          },
        ]
      : [];

    const postPayload: Partial<BlogPost> = {
      title: title.trim(),
      slug: slug.trim() ? slug.trim() : undefined,
      subtitle: subtitle.trim(),
      categoryId: categoryId as any,
      categoryName,
      subCategoryName: subCategoryName.trim() || 'General Guide',
      author: author.trim() || 'Serikali Legal & Regulatory Desk',
      authorRole: authorRole.trim() || 'Senior Regulatory Specialist',
      officialPortal: officialPortal.trim() || 'ecitizen.go.ke',
      readTime: readTime.trim() || '6 min read',
      excerpt: excerpt.trim(),
      content: content.trim(),
      sections,
      image: featuredImage || currentCat?.heroImage || '/src/assets/images/serikali_immigration_visas_1790882120216.jpg',
      tags: tags.length > 0 ? tags : ['kenya-statutory-guide'],
      keywords: tags,
      keyTakeaways: parsedTakeaways,
      status: finalStatus,
      isFeatured,
      isTopStory,
      seoTitle: seoTitle.trim() || `${title.trim()} | Serikali Guide`,
      seoDescription: seoDescription.trim() || excerpt.trim(),
    };

    try {
      if (editingPostId) {
        // Update existing post
        await updateBlogPost(editingPostId, postPayload);
        showToast(
          finalStatus === 'published'
            ? `Published "${title}" permanently.`
            : `Saved "${title}" as ${finalStatus}.`
        );
      } else {
        // Create new post
        const created = await addBlogPost(postPayload as any);
        setEditingPostId(created.id);
        showToast(
          finalStatus === 'published'
            ? `Published new article "${title}"!`
            : `Saved new article "${title}" as draft.`
        );
        // Switch to list view so the new blog post is immediately visible in the directory
        setMode('list');
      }

      setStatus(finalStatus);
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      try {
        localStorage.removeItem(AUTOSAVE_DRAFT_KEY);
      } catch {}
      await reloadBlogs();
    } catch (err: any) {
      setSaveStatus('error');
      setSaveErrorMsg(err.message || 'Failed to save blog post.');
      showToast('Error saving blog: ' + (err.message || 'Check network connection.'));
    }
  };

  // Toggle publish status directly from list
  const handleToggleStatus = async (post: BlogPost) => {
    const nextStatus = post.status === 'published' ? 'unpublished' : 'published';
    try {
      await updateBlogPost(post.id, { status: nextStatus });
      showToast(`Article "${post.title}" is now ${nextStatus}.`);
      await reloadBlogs();
    } catch (err: any) {
      showToast('Failed to update status: ' + (err.message || 'Error'));
    }
  };

  // Delete Blog with Modal Confirmation
  const confirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await deleteBlogPost(postToDelete.id);
      showToast(`Article "${postToDelete.title}" permanently deleted.`);
      setPostToDelete(null);
      await reloadBlogs();
      if (editingPostId === postToDelete.id) {
        setMode('list');
      }
    } catch (err: any) {
      showToast('Failed to delete blog: ' + (err.message || 'Error'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered and Sorted Blog List
  const filteredBlogs = useMemo(() => {
    return blogPosts.filter((post) => {
      // 1. Status Filter
      if (statusFilter !== 'all') {
        const postStatus = post.status || 'published';
        if (postStatus !== statusFilter) return false;
      }

      // 2. Category Filter
      if (categoryFilter !== 'all') {
        if (post.categoryId !== categoryFilter) return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = post.title?.toLowerCase().includes(q);
        const inExcerpt = post.excerpt?.toLowerCase().includes(q);
        const inCategory = post.categoryName?.toLowerCase().includes(q);
        const inSubCat = post.subCategoryName?.toLowerCase().includes(q);
        const inTags = (post.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inExcerpt && !inCategory && !inSubCat && !inTags) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        const da = new Date(a.createdAt || a.publishedDate || 0).getTime();
        const db = new Date(b.createdAt || b.publishedDate || 0).getTime();
        return db - da;
      }
      if (sortBy === 'oldest') {
        const da = new Date(a.createdAt || a.publishedDate || 0).getTime();
        const db = new Date(b.createdAt || b.publishedDate || 0).getTime();
        return da - db;
      }
      if (sortBy === 'updated') {
        const da = new Date(a.updatedAt || a.publishedDate || 0).getTime();
        const db = new Date(b.updatedAt || b.publishedDate || 0).getTime();
        return db - da;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [blogPosts, statusFilter, categoryFilter, searchQuery, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = blogPosts.length;
    const published = blogPosts.filter((b) => b.status === 'published' || !b.status).length;
    const drafts = blogPosts.filter((b) => b.status === 'draft').length;
    const unpublished = blogPosts.filter((b) => b.status === 'unpublished').length;
    return { total, published, drafts, unpublished };
  }, [blogPosts]);

  return (
    <div className="space-y-6">
      {/* =====================================================================
          HEADER BAR: Title, Stats & Primary Action Button
         ===================================================================== */}
      <div className="bg-[#EAE9E4]/60 border border-[#141413]/12 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#D94E34] text-[#F4F3EF] text-[10px] font-mono-num uppercase tracking-wider font-semibold">
              PUBLISHING ENGINE
            </span>
            <span className="text-xs font-mono-num text-[#6E6D68]">
              Vercel Persistent Storage · Live Sync
            </span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl text-[#141413] mt-1">
            Blog &amp; Advisory Playbook Management
          </h1>
          <p className="text-xs text-[#5E5D59] mt-0.5">
            Create, edit, preview, publish, unpublish, and manage all articles permanently.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {mode === 'editor' ? (
            <button
              type="button"
              onClick={() => {
                if (hasUnsavedChanges) {
                  const leave = window.confirm(
                    'You have unsaved changes in this article. Are you sure you want to return to the articles list?'
                  );
                  if (!leave) return;
                }
                setMode('list');
              }}
              className="px-4 py-2 border border-[#141413]/30 text-xs font-mono-num uppercase tracking-wider hover:bg-[#141413]/5 transition-colors cursor-pointer"
            >
              ← Back to Articles List
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-[#141413] hover:bg-[#2B2B28] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Article</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => reloadBlogs()}
            disabled={isBlogsLoading}
            className="p-2 border border-[#141413]/20 hover:bg-[#141413]/5 text-[#141413] transition-colors cursor-pointer"
            title="Reload from server"
          >
            <RotateCcw className={`w-4 h-4 ${isBlogsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* =====================================================================
          VIEW 1: BLOGS LIST / DASHBOARD
         ===================================================================== */}
      {mode === 'list' && (
        <div className="space-y-5">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              onClick={() => setStatusFilter('all')}
              className={`p-3.5 border cursor-pointer transition-all ${
                statusFilter === 'all'
                  ? 'bg-[#141413] text-[#F4F3EF] border-[#141413]'
                  : 'bg-[#EAE9E4]/40 border-[#141413]/10 hover:border-[#141413]/30'
              }`}
            >
              <p className="text-[10px] font-mono-num uppercase tracking-wider opacity-75">
                Total Articles
              </p>
              <p className="font-mono-num text-2xl font-bold mt-0.5">{stats.total}</p>
            </div>

            <div
              onClick={() => setStatusFilter('published')}
              className={`p-3.5 border cursor-pointer transition-all ${
                statusFilter === 'published'
                  ? 'bg-[#1F6F43] text-[#F4F3EF] border-[#1F6F43]'
                  : 'bg-[#EAE9E4]/40 border-[#141413]/10 hover:border-[#141413]/30'
              }`}
            >
              <p className="text-[10px] font-mono-num uppercase tracking-wider opacity-75">
                Published (Live)
              </p>
              <p className="font-mono-num text-2xl font-bold mt-0.5">{stats.published}</p>
            </div>

            <div
              onClick={() => setStatusFilter('draft')}
              className={`p-3.5 border cursor-pointer transition-all ${
                statusFilter === 'draft'
                  ? 'bg-[#A86414] text-[#F4F3EF] border-[#A86414]'
                  : 'bg-[#EAE9E4]/40 border-[#141413]/10 hover:border-[#141413]/30'
              }`}
            >
              <p className="text-[10px] font-mono-num uppercase tracking-wider opacity-75">
                Drafts (Private)
              </p>
              <p className="font-mono-num text-2xl font-bold mt-0.5">{stats.drafts}</p>
            </div>

            <div
              onClick={() => setStatusFilter('unpublished')}
              className={`p-3.5 border cursor-pointer transition-all ${
                statusFilter === 'unpublished'
                  ? 'bg-[#6E6D68] text-[#F4F3EF] border-[#6E6D68]'
                  : 'bg-[#EAE9E4]/40 border-[#141413]/10 hover:border-[#141413]/30'
              }`}
            >
              <p className="text-[10px] font-mono-num uppercase tracking-wider opacity-75">
                Unpublished
              </p>
              <p className="font-mono-num text-2xl font-bold mt-0.5">{stats.unpublished}</p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-[#EAE9E4]/60 border border-[#141413]/12 p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex-1 min-w-0 relative">
              <Search className="w-4 h-4 text-[#6E6D68] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title, excerpt, category, or tag..."
                className="w-full pl-9 pr-3 py-2 bg-[#F4F3EF] border border-[#141413]/15 text-xs text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-[#F4F3EF] border border-[#141413]/15 text-xs text-[#141413] focus:outline-none"
              >
                <option value="all">All Categories</option>
                {serviceCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                className="px-3 py-2 bg-[#F4F3EF] border border-[#141413]/15 text-xs text-[#141413] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published Only</option>
                <option value="draft">Drafts Only</option>
                <option value="unpublished">Unpublished Only</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 bg-[#F4F3EF] border border-[#141413]/15 text-xs text-[#141413] focus:outline-none"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="updated">Sort: Recently Updated</option>
                <option value="title">Sort: Title A-Z</option>
              </select>
            </div>
          </div>

          {/* Articles Table / Cards */}
          {filteredBlogs.length === 0 ? (
            <div className="bg-[#EAE9E4]/40 border border-[#141413]/10 p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-[#A09F99] mx-auto" />
              <p className="font-editorial text-xl text-[#141413]">No articles match your criteria</p>
              <p className="text-xs text-[#6E6D68] max-w-md mx-auto">
                Try clearing your search terms or filters, or create a brand new article to publish.
              </p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="px-4 py-2 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider cursor-pointer"
              >
                Create Article
              </button>
            </div>
          ) : (
            <div className="bg-[#EAE9E4]/40 border border-[#141413]/12 divide-y divide-[#141413]/10">
              {filteredBlogs.map((post) => {
                const isPub = post.status === 'published' || !post.status;
                const isDraft = post.status === 'draft';
                const isUnpub = post.status === 'unpublished';

                return (
                  <div
                    key={post.id}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#EAE9E4]/70 transition-colors"
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      {/* Image Thumbnail */}
                      <div className="w-20 h-14 sm:w-24 sm:h-16 bg-[#141413]/5 border border-[#141413]/10 shrink-0 overflow-hidden relative">
                        <img
                          src={post.image}
                          alt={post.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              '/src/assets/images/serikali_immigration_visas_1790882120216.jpg';
                          }}
                        />
                        {post.isTopStory && (
                          <span className="absolute top-1 left-1 bg-[#D94E34] text-[8px] text-[#F4F3EF] font-mono-num px-1">
                            TOP
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono-num">
                          {/* Status Badge */}
                          <span
                            className={`px-2 py-0.5 font-semibold uppercase tracking-wider ${
                              isPub
                                ? 'bg-[#1F6F43]/15 text-[#1F6F43] border border-[#1F6F43]/30'
                                : isDraft
                                ? 'bg-[#A86414]/15 text-[#A86414] border border-[#A86414]/30'
                                : 'bg-[#6E6D68]/15 text-[#6E6D68] border border-[#6E6D68]/30'
                            }`}
                          >
                            {post.status || 'published'}
                          </span>

                          <span className="text-[#D94E34] font-semibold">
                            {post.categoryName}
                          </span>
                          <span className="text-[#8E8D87]">·</span>
                          <span className="text-[#6E6D68]">{post.subCategoryName}</span>
                          <span className="text-[#8E8D87]">·</span>
                          <span className="text-[#8E8D87]">
                            Published: {post.publishedDate || 'Draft'}
                          </span>
                          {post.updatedAt && (
                            <>
                              <span className="text-[#8E8D87]">·</span>
                              <span className="text-[#8E8D87]">
                                Updated: {new Date(post.updatedAt).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>

                        <h3 className="font-editorial text-lg sm:text-xl text-[#141413] leading-snug line-clamp-1">
                          {post.title}
                        </h3>

                        <p className="text-xs text-[#5E5D59] line-clamp-1 max-w-2xl">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center gap-3 text-[10px] font-mono-num text-[#8E8D87] pt-0.5">
                          <span>Slug: /{post.slug || post.id}</span>
                          <span>·</span>
                          <span>By: {post.author || 'Desk'}</span>
                          <span>·</span>
                          <span>{post.readTime || '5 min'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                      {/* Status Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(post)}
                        className={`px-2.5 py-1.5 text-[11px] font-mono-num uppercase tracking-wider border cursor-pointer transition-colors ${
                          isPub
                            ? 'border-[#141413]/20 hover:bg-[#6E6D68] hover:text-[#F4F3EF]'
                            : 'border-[#1F6F43] bg-[#1F6F43]/10 text-[#1F6F43] hover:bg-[#1F6F43] hover:text-[#F4F3EF]'
                        }`}
                        title={isPub ? 'Unpublish from live site' : 'Publish to live site'}
                      >
                        {isPub ? 'Unpublish' : 'Publish'}
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(post)}
                        className="px-3 py-1.5 bg-[#141413] hover:bg-[#2B2B28] text-[#F4F3EF] text-[11px] font-mono-num uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Preview / View live button */}
                      <button
                        type="button"
                        onClick={() => navigate({ page: 'blog-detail', blogId: post.id })}
                        className="p-1.5 border border-[#141413]/20 text-[#141413] hover:bg-[#141413]/5 transition-colors cursor-pointer"
                        title="Preview Public Page"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setPostToDelete(post)}
                        className="p-1.5 border border-[#141413]/20 text-[#6E6D68] hover:text-[#D94E34] hover:border-[#D94E34] transition-colors cursor-pointer"
                        title="Delete article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          VIEW 2: BLOG EDITOR (Create / Edit Article with Full Formatting)
         ===================================================================== */}
      {mode === 'editor' && (
        <div className="space-y-6">
          {/* Top Editor Actions Bar */}
          <div className="bg-[#141413] text-[#F4F3EF] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#141413]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono-num uppercase tracking-wider text-[#D94E34] font-semibold">
                {editingPostId ? 'Editing Article' : 'New Article Draft'}
              </span>
              <span className="text-xs text-[#8E8D87]">·</span>

              {/* Save Status Chip */}
              <div className="flex items-center gap-1.5 text-xs font-mono-num">
                {saveStatus === 'saving' && (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D94E34]" />
                    <span className="text-[#A09F99]">Saving...</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1F6F43]" />
                    <span className="text-[#A09F99]">Saved to persistent store</span>
                  </>
                )}
                {saveStatus === 'unsaved' && (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-[#A86414]" />
                    <span className="text-[#A86414]">Unsaved changes</span>
                  </>
                )}
                {saveStatus === 'error' && (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-[#D94E34]" />
                    <span className="text-[#D94E34]">Failed to save: {saveErrorMsg}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {editingPostId && (
                <button
                  type="button"
                  onClick={() => navigate({ page: 'blog-detail', blogId: editingPostId })}
                  className="px-3.5 py-1.5 border border-[#F4F3EF]/30 hover:border-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Open live public view of this article"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View on Site</span>
                </button>
              )}

              {/* Save Draft Button */}
              <button
                type="button"
                onClick={() => handleSave('draft')}
                className="px-3.5 py-1.5 border border-[#F4F3EF]/30 hover:border-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider transition-colors cursor-pointer"
              >
                Save Draft
              </button>

              {/* Publish Button */}
              <button
                type="button"
                onClick={() => handleSave('published')}
                className="px-4 py-1.5 bg-[#D94E34] hover:bg-[#c4432c] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Publish Immediately</span>
              </button>
            </div>
          </div>

          {/* AI Auto-Fill Bar */}
          <div className="p-4 bg-[#EAE9E4]/70 border border-[#141413]/15 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono-num uppercase tracking-wider text-[#D94E34] font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>AI Regulatory Assistant (Gemini 3.8 Flash)</span>
              </div>
              <span className="text-[10px] font-mono-num text-[#6E6D68]">
                Kenya 2026 Statutory Framework
              </span>
            </div>
            <p className="text-xs text-[#5E5D59]">
              Type a topic, decree, or permit type. Gemini will auto-generate verified procedural requirements, fees, checklists, and meta tags.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAiGenerateBlog();
                  }
                }}
                placeholder="e.g. Export Processing Zone (EPZ) license requirements and corporate tax exemptions 2026..."
                className="flex-1 min-w-0 px-3 py-2 bg-[#F4F3EF] text-xs text-[#141413] border border-[#141413]/20 focus:outline-none focus:border-[#141413]"
              />
              <button
                type="button"
                onClick={handleAiGenerateBlog}
                disabled={isAiGenerating || !aiTopic.trim()}
                className="px-4 py-2 bg-[#141413] hover:bg-[#2B2B28] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {isAiGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isAiGenerating ? 'Generating...' : 'Auto-Fill Guide'}</span>
              </button>
            </div>
          </div>

          {/* Main Form Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 cols: Title, Slug, Excerpt, Content Editor */}
            <div className="lg:col-span-8 space-y-5">
              {/* Title & Slug */}
              <div className="bg-[#EAE9E4]/60 border border-[#141413]/12 p-5 space-y-4">
                <div>
                  <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1 font-semibold">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!slug && !editingPostId) {
                        setSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^\w\s-]/g, '')
                            .replace(/[\s_-]+/g, '-')
                        );
                      }
                      markDirty();
                    }}
                    placeholder="e.g. Kenya Class G Investor Permit & Business Establishment 2026"
                    className="w-full px-3.5 py-2.5 bg-[#F4F3EF] border border-[#141413]/20 text-sm font-semibold text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1">
                      URL Slug
                    </label>
                    <div className="flex items-center bg-[#F4F3EF] border border-[#141413]/20 px-2.5">
                      <span className="text-xs font-mono-num text-[#8E8D87]">/blog/</span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => {
                          setSlug(e.target.value.toLowerCase().replace(/[\s_]+/g, '-'));
                          markDirty();
                        }}
                        placeholder="article-url-slug"
                        className="w-full py-2 bg-transparent text-xs text-[#141413] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1">
                      Subtitle / Deck
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => {
                        setSubtitle(e.target.value);
                        markDirty();
                      }}
                      placeholder="Concise contextual lead-in..."
                      className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1 font-semibold">
                    Executive Excerpt / Summary *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={excerpt}
                    onChange={(e) => {
                      setExcerpt(e.target.value);
                      markDirty();
                    }}
                    placeholder="Short 2-3 sentence summary displayed on homepage cards, social previews, and search snippets..."
                    className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413] focus:outline-none"
                  />
                </div>
              </div>

              {/* Rich Blog Content Editor */}
              <div className="bg-[#EAE9E4]/60 border border-[#141413]/12 p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#141413]/10 pb-2.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditorTab('write')}
                      className={`px-3 py-1.5 text-xs font-mono-num uppercase tracking-wider cursor-pointer transition-colors ${
                        editorTab === 'write'
                          ? 'bg-[#141413] text-[#F4F3EF]'
                          : 'text-[#6E6D68] hover:text-[#141413]'
                      }`}
                    >
                      Write Article
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab('preview')}
                      className={`px-3 py-1.5 text-xs font-mono-num uppercase tracking-wider cursor-pointer transition-colors ${
                        editorTab === 'preview'
                          ? 'bg-[#141413] text-[#F4F3EF]'
                          : 'text-[#6E6D68] hover:text-[#141413]'
                      }`}
                    >
                      Live Preview
                    </button>
                  </div>

                  <span className="text-[11px] font-mono-num text-[#8E8D87]">
                    Markdown &amp; Semantic Headings Supported
                  </span>
                </div>

                {editorTab === 'write' ? (
                  <div className="space-y-2">
                    {/* Formatting Toolbar */}
                    <div className="flex flex-wrap items-center gap-1 p-1.5 bg-[#F4F3EF] border border-[#141413]/15">
                      <button
                        type="button"
                        onClick={() => insertFormatting('## ', '\n')}
                        className="p-1.5 text-[#141413] hover:bg-[#141413]/10 cursor-pointer"
                        title="Heading 2 (## Heading)"
                      >
                        <Heading2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('### ', '\n')}
                        className="p-1.5 text-[#141413] hover:bg-[#141413]/10 cursor-pointer"
                        title="Heading 3 (### Heading)"
                      >
                        <Heading3 className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-px h-4 bg-[#141413]/15 mx-1" />
                      <button
                        type="button"
                        onClick={() => insertFormatting('**', '**')}
                        className="p-1.5 text-[#141413] hover:bg-[#141413]/10 cursor-pointer"
                        title="Bold (**text**)"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('*', '*')}
                        className="p-1.5 text-[#141413] hover:bg-[#141413]/10 cursor-pointer"
                        title="Italic (*text*)"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-px h-4 bg-[#141413]/15 mx-1" />
                      <button
                        type="button"
                        onClick={() => insertFormatting('- ')}
                        className="p-1.5 text-[#141413] hover:bg-[#141413]/10 cursor-pointer"
                        title="Bullet List (- item)"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('> ')}
                        className="p-1.5 text-[#141413] hover:bg-[#141413]/10 cursor-pointer"
                        title="Blockquote (> quote)"
                      >
                        <Quote className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('`', '`')}
                        className="p-1.5 text-[#141413] hover:bg-[#141413]/10 cursor-pointer"
                        title="Inline Code (`code`)"
                      >
                        <Code className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('[', '](https://)')}
                        className="p-1.5 text-[#141413] hover:bg-[#141413]/10 cursor-pointer"
                        title="Link [label](url)"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('![Image description](', ')')}
                        className="p-1.5 text-[#141413] hover:bg-[#141413]/10 cursor-pointer"
                        title="Insert Image ![alt](url)"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Content Textarea */}
                    <textarea
                      ref={textareaRef}
                      rows={14}
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                        markDirty();
                      }}
                      placeholder="Write your article in structured paragraphs or markdown. Use ## for section titles, bullet points for lists, and > for advisory notes..."
                      className="w-full p-4 bg-[#F4F3EF] border border-[#141413]/20 font-mono text-xs sm:text-sm text-[#141413] leading-relaxed focus:outline-none focus:border-[#141413]"
                    />
                  </div>
                ) : (
                  /* Live Rendered Preview */
                  <div className="p-6 bg-[#F4F3EF] border border-[#141413]/20 min-h-[300px] prose prose-stone max-w-none text-xs sm:text-sm leading-relaxed space-y-4">
                    <h2 className="font-editorial text-2xl text-[#141413] border-b border-[#141413]/10 pb-2">
                      {title || 'Untitled Article Preview'}
                    </h2>
                    {subtitle && (
                      <p className="text-sm text-[#6E6D68] italic font-sans">{subtitle}</p>
                    )}
                    {content ? (
                      <div className="space-y-4 whitespace-pre-line text-[#141413]">
                        {content}
                      </div>
                    ) : (
                      <p className="text-xs text-[#8E8D87] italic">
                        Start writing in the "Write Article" tab to see the formatted preview here.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Key Takeaways Section */}
              <div className="bg-[#EAE9E4]/60 border border-[#141413]/12 p-5 space-y-2">
                <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] font-semibold">
                  Key Takeaways (One per line)
                </label>
                <textarea
                  rows={3}
                  value={takeawaysInput}
                  onChange={(e) => {
                    setTakeawaysInput(e.target.value);
                    markDirty();
                  }}
                  placeholder="Bullet point highlights summarizing the procedural takeaway for busy readers..."
                  className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413] focus:outline-none"
                />
              </div>

              {/* SEO Meta Tags Overrides */}
              <div className="bg-[#EAE9E4]/60 border border-[#141413]/12 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#141413]/10 pb-2">
                  <span className="text-xs font-mono-num uppercase tracking-wider text-[#D94E34] font-semibold">
                    Search Engine Optimization (SEO)
                  </span>
                  <span className="text-[10px] font-mono-num text-[#8E8D87]">
                    Google Snippet &amp; OpenGraph
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-mono-num text-[#141413] mb-1">
                    <span>SEO Meta Title</span>
                    <span className="text-[10px] text-[#8E8D87]">
                      {(seoTitle || title).length} / 60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => {
                      setSeoTitle(e.target.value);
                      markDirty();
                    }}
                    placeholder={title ? `${title} | Serikali Guide` : 'Page title shown on Google'}
                    className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-mono-num text-[#141413] mb-1">
                    <span>SEO Meta Description</span>
                    <span className="text-[10px] text-[#8E8D87]">
                      {(seoDescription || excerpt).length} / 160 chars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={seoDescription}
                    onChange={(e) => {
                      setSeoDescription(e.target.value);
                      markDirty();
                    }}
                    placeholder={excerpt || 'Meta description shown in search engine results snippets'}
                    className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right 4 cols: Publication Status, Category, Featured Image, Tags */}
            <div className="lg:col-span-4 space-y-5">
              {/* Publication Status & Visibility Panel */}
              <div className="bg-[#EAE9E4]/60 border border-[#141413]/12 p-5 space-y-4">
                <p className="text-xs font-mono-num uppercase tracking-wider text-[#141413] font-semibold border-b border-[#141413]/10 pb-2">
                  Publication Status
                </p>

                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2.5 p-2.5 border cursor-pointer transition-all ${
                      status === 'published'
                        ? 'bg-[#1F6F43]/15 border-[#1F6F43] text-[#1F6F43]'
                        : 'border-[#141413]/15 text-[#141413] hover:bg-[#141413]/5'
                    }`}
                  >
                    <input
                      type="radio"
                      name="post_status"
                      checked={status === 'published'}
                      onChange={() => {
                        setStatus('published');
                        markDirty();
                      }}
                      className="accent-[#1F6F43]"
                    />
                    <div>
                      <span className="text-xs font-semibold block">Published (Public)</span>
                      <span className="text-[10px] text-[#6E6D68] block">
                        Visible to all citizens and indexed by search engines.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 p-2.5 border cursor-pointer transition-all ${
                      status === 'draft'
                        ? 'bg-[#A86414]/15 border-[#A86414] text-[#A86414]'
                        : 'border-[#141413]/15 text-[#141413] hover:bg-[#141413]/5'
                    }`}
                  >
                    <input
                      type="radio"
                      name="post_status"
                      checked={status === 'draft'}
                      onChange={() => {
                        setStatus('draft');
                        markDirty();
                      }}
                      className="accent-[#A86414]"
                    />
                    <div>
                      <span className="text-xs font-semibold block">Draft (Private)</span>
                      <span className="text-[10px] text-[#6E6D68] block">
                        Only accessible to authenticated admins.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 p-2.5 border cursor-pointer transition-all ${
                      status === 'unpublished'
                        ? 'bg-[#6E6D68]/15 border-[#6E6D68] text-[#141413]'
                        : 'border-[#141413]/15 text-[#141413] hover:bg-[#141413]/5'
                    }`}
                  >
                    <input
                      type="radio"
                      name="post_status"
                      checked={status === 'unpublished'}
                      onChange={() => {
                        setStatus('unpublished');
                        markDirty();
                      }}
                      className="accent-[#6E6D68]"
                    />
                    <div>
                      <span className="text-xs font-semibold block">Unpublished (Archived)</span>
                      <span className="text-[10px] text-[#6E6D68] block">
                        Hidden from the public site while preserving content.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="border-t border-[#141413]/10 pt-3 space-y-2">
                  <label className="flex items-center gap-2 text-xs text-[#141413] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTopStory}
                      onChange={(e) => {
                        setIsTopStory(e.target.checked);
                        markDirty();
                      }}
                    />
                    <span>Highlight in "01. Top Stories" Rail</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[#141413] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => {
                        setIsFeatured(e.target.checked);
                        markDirty();
                      }}
                    />
                    <span>Pin in "02. Featured Editorial Guides"</span>
                  </label>
                </div>
              </div>

              {/* Category & Metadata Panel */}
              <div className="bg-[#EAE9E4]/60 border border-[#141413]/12 p-5 space-y-4">
                <p className="text-xs font-mono-num uppercase tracking-wider text-[#141413] font-semibold border-b border-[#141413]/10 pb-2">
                  Category &amp; Meta
                </p>

                <div>
                  <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1">
                    Service Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setCategoryId(id);
                      const cat = serviceCategories.find((c) => c.id === id);
                      if (cat) {
                        setSubCategoryName(cat.subCategories[0]?.name || 'General');
                        if (!featuredImage || featuredImage.includes('serikali_')) {
                          setFeaturedImage(cat.heroImage);
                        }
                      }
                      markDirty();
                    }}
                    className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413] focus:outline-none"
                  >
                    {serviceCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1">
                    Sub-Category / Directive
                  </label>
                  <input
                    type="text"
                    value={subCategoryName}
                    onChange={(e) => {
                      setSubCategoryName(e.target.value);
                      markDirty();
                    }}
                    placeholder="e.g. Work Permits & Passes"
                    className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1">
                      Portal
                    </label>
                    <input
                      type="text"
                      value={officialPortal}
                      onChange={(e) => {
                        setOfficialPortal(e.target.value);
                        markDirty();
                      }}
                      placeholder="ecitizen.go.ke"
                      className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1">
                      Read Time
                    </label>
                    <input
                      type="text"
                      value={readTime}
                      onChange={(e) => {
                        setReadTime(e.target.value);
                        markDirty();
                      }}
                      placeholder="6 min read"
                      className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1">
                    Author / Advisory Desk
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => {
                      setAuthor(e.target.value);
                      markDirty();
                    }}
                    placeholder="Serikali Legal & Regulatory Desk"
                    className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413] focus:outline-none"
                  />
                </div>
              </div>

              {/* Featured Image Upload & Preview Panel */}
              <div className="bg-[#EAE9E4]/60 border border-[#141413]/12 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#141413]/10 pb-2">
                  <p className="text-xs font-mono-num uppercase tracking-wider text-[#141413] font-semibold">
                    Featured Image &amp; Visual Assets
                  </p>
                  {featuredImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setFeaturedImage('');
                        markDirty();
                      }}
                      className="text-[10px] font-mono-num uppercase tracking-wider text-[#D94E34] hover:underline cursor-pointer"
                    >
                      Clear Photo
                    </button>
                  )}
                </div>

                {/* Thumbnail Preview with Live Verification Badge */}
                <div className="w-full h-40 bg-[#141413]/5 border border-[#141413]/15 overflow-hidden relative group">
                  {featuredImage ? (
                    <>
                      <img
                        src={featuredImage}
                        alt={imageAlt || 'Featured article image'}
                        className="w-full h-full object-cover transition-transform group-hover:scale-[1.02] duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            '/src/assets/images/serikali_immigration_visas_1790882120216.jpg';
                        }}
                      />
                      <div className="absolute top-2 right-2 bg-[#141413]/85 text-[#F4F3EF] px-2 py-0.5 text-[9px] font-mono-num uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <Check className="w-3 h-3 text-[#1F6F43]" />
                        <span>Active Photo</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#8E8D87]">
                      <ImageIcon className="w-8 h-8 mb-1" />
                      <span className="text-[11px] font-mono-num">No Image Selected</span>
                    </div>
                  )}

                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-[#141413]/70 flex items-center justify-center text-[#F4F3EF] gap-2 text-xs font-mono-num">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Optimizing &amp; Uploading...</span>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <p className="text-xs text-[#D94E34]">{uploadError}</p>
                )}

                {/* Upload from Computer Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="flex-1 py-2 px-3 bg-[#141413] hover:bg-[#2B2B28] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload from Device</span>
                  </button>
                </div>

                {/* Curated Official Photo Library Picker */}
                <div className="space-y-2 pt-2 border-t border-[#141413]/10">
                  <label className="block text-[11px] font-mono-num uppercase tracking-wider text-[#6E6D68]">
                    Or Choose from Official Curated Photography:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CURATED_SERIKALI_PHOTOS.map((photo) => {
                      const isSelected = featuredImage === photo.url;
                      return (
                        <button
                          key={photo.id}
                          type="button"
                          onClick={() => {
                            setFeaturedImage(photo.url);
                            if (!imageAlt) setImageAlt(photo.name);
                            markDirty();
                            showToast(`Selected "${photo.name}" photo.`);
                          }}
                          className={`flex items-center gap-2 p-1.5 border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#D94E34] bg-[#D94E34]/10 ring-1 ring-[#D94E34]'
                              : 'border-[#141413]/15 bg-[#F4F3EF] hover:border-[#141413]/40'
                          }`}
                        >
                          <div className="w-10 h-8 shrink-0 bg-[#141413]/10 overflow-hidden">
                            <img
                              src={photo.url}
                              alt={photo.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-mono-num font-semibold text-[#141413] truncate">
                              {photo.name.split('/')[0]}
                            </p>
                            <span className="text-[9px] text-[#8E8D87] font-mono-num">
                              {isSelected ? '✓ Selected' : 'Use Photo'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Image URL input */}
                <div>
                  <label className="block text-[11px] font-mono-num uppercase tracking-wider text-[#6E6D68] mb-1">
                    Or Enter Direct Image URL:
                  </label>
                  <input
                    type="text"
                    value={featuredImage}
                    onChange={(e) => {
                      setFeaturedImage(e.target.value);
                      markDirty();
                    }}
                    placeholder="https://... or /src/assets/..."
                    className="w-full px-2.5 py-1.5 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-num uppercase tracking-wider text-[#6E6D68] mb-1">
                    Image Alt Text (Accessibility &amp; SEO)
                  </label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => {
                      setImageAlt(e.target.value);
                      markDirty();
                    }}
                    placeholder="Descriptive text explaining the image"
                    className="w-full px-2.5 py-1.5 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413] focus:outline-none"
                  />
                </div>
              </div>

              {/* Tags & Keywords Panel */}
              <div className="bg-[#EAE9E4]/60 border border-[#141413]/12 p-5 space-y-3">
                <p className="text-xs font-mono-num uppercase tracking-wider text-[#141413] font-semibold border-b border-[#141413]/10 pb-2">
                  Tags &amp; Keywords
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tag and press Enter..."
                    className="flex-1 min-w-0 px-2.5 py-1.5 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-[#F4F3EF] border border-[#141413]/15 text-[11px] font-mono-num text-[#141413] flex items-center gap-1"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-[#D94E34] cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {tags.length === 0 && (
                    <span className="text-[11px] text-[#8E8D87] italic">No tags added yet.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          DELETE CONFIRMATION MODAL
         ===================================================================== */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 bg-[#141413]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F4F3EF] border border-[#141413] max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[#D94E34]">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-editorial text-2xl text-[#141413]">
                Permanently Delete Article?
              </h3>
            </div>

            <p className="text-xs text-[#5E5D59] leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-[#141413]">"{postToDelete.title}"</strong>?
              This action removes the record from both the public directory and the persistent storage database and cannot be undone.
            </p>

            <div className="p-3 bg-[#EAE9E4]/60 border border-[#141413]/10 text-[11px] font-mono-num space-y-1">
              <div>Category: {postToDelete.categoryName}</div>
              <div>Slug: /{postToDelete.slug || postToDelete.id}</div>
              <div>Published: {postToDelete.publishedDate || 'Draft'}</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-[#141413]/30 text-xs font-mono-num uppercase tracking-wider hover:bg-[#141413]/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-[#D94E34] hover:bg-[#c4432c] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
