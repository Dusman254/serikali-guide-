import React, { useEffect, useMemo } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useSerikali } from '../context/SerikaliContext';

interface BreadcrumbItem {
  label: string;
  url?: string;
  onClick?: () => void;
  isCurrent?: boolean;
}

export const BreadcrumbNav: React.FC = () => {
  const { route, navigate } = useStore();
  const { serviceCategories, blogPosts } = useSerikali();

  const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
    // On the home page, breadcrumbs are not needed
    if (route.page === 'home') {
      return [];
    }

    const items: BreadcrumbItem[] = [
      {
        label: 'Home',
        url: 'https://serikaliguide.co.ke/',
        onClick: () => navigate({ page: 'home' }),
      },
    ];

    switch (route.page) {
      case 'about':
        items.push({
          label: 'About Advisory Desk',
          url: 'https://serikaliguide.co.ke/about',
          isCurrent: true,
        });
        break;

      case 'blogs':
        if (route.categoryId && route.categoryId !== 'all') {
          const cat = serviceCategories.find((c) => c.id === route.categoryId);
          items.push({
            label: 'Blogs & Playbooks',
            url: 'https://serikaliguide.co.ke/blogs',
            onClick: () => navigate({ page: 'blogs', categoryId: 'all' }),
          });
          items.push({
            label: cat?.name || route.categoryId,
            url: `https://serikaliguide.co.ke/blogs?category=${route.categoryId}`,
            isCurrent: true,
          });
        } else if (route.query) {
          items.push({
            label: 'Blogs & Playbooks',
            url: 'https://serikaliguide.co.ke/blogs',
            onClick: () => navigate({ page: 'blogs', categoryId: 'all' }),
          });
          items.push({
            label: `Search: "${route.query}"`,
            isCurrent: true,
          });
        } else {
          items.push({
            label: 'Blogs & Playbooks',
            url: 'https://serikaliguide.co.ke/blogs',
            isCurrent: true,
          });
        }
        break;

      case 'blog-detail': {
        const post = blogPosts.find((b) => b.id === route.blogId);
        items.push({
          label: 'Blogs',
          url: 'https://serikaliguide.co.ke/blogs',
          onClick: () => navigate({ page: 'blogs', categoryId: 'all' }),
        });
        if (post) {
          items.push({
            label: post.categoryName,
            url: `https://serikaliguide.co.ke/blogs?category=${post.categoryId}`,
            onClick: () =>
              navigate({ page: 'blogs', categoryId: post.categoryId }),
          });
          items.push({
            label: post.title,
            url: `https://serikaliguide.co.ke/blog/${post.slug || post.id}`,
            isCurrent: true,
          });
        } else {
          items.push({
            label: 'Regulatory Guide',
            isCurrent: true,
          });
        }
        break;
      }

      case 'service-subcategories': {
        const cat = serviceCategories.find((c) => c.id === route.serviceId);
        items.push({
          label: 'Service Pillars',
          url: 'https://serikaliguide.co.ke/#services',
          onClick: () => navigate({ page: 'home' }),
        });
        if (cat) {
          items.push({
            label: cat.name,
            url: `https://serikaliguide.co.ke/services/${cat.id}`,
            isCurrent: true,
          });
        } else {
          items.push({
            label: 'Service Overview',
            isCurrent: true,
          });
        }
        break;
      }

      case 'service-detail': {
        const cat = serviceCategories.find((c) => c.id === route.serviceId);
        const sub = cat?.subCategories.find(
          (s) => s.id === route.subCategoryId
        );
        items.push({
          label: 'Service Pillars',
          url: 'https://serikaliguide.co.ke/#services',
          onClick: () => navigate({ page: 'home' }),
        });
        if (cat) {
          items.push({
            label: cat.name,
            url: `https://serikaliguide.co.ke/services/${cat.id}`,
            onClick: () =>
              navigate({
                page: 'service-subcategories',
                serviceId: cat.id,
              }),
          });
        }
        if (sub) {
          items.push({
            label: sub.name,
            url: `https://serikaliguide.co.ke/services/${cat?.id || 'service'}/${sub.id}`,
            isCurrent: true,
          });
        } else {
          items.push({
            label: 'Procedural Checklist',
            isCurrent: true,
          });
        }
        break;
      }

      case 'consultation':
        items.push({
          label: 'Free 20-Min Consultation',
          url: 'https://serikaliguide.co.ke/consultation',
          isCurrent: true,
        });
        break;

      case 'contact':
        items.push({
          label: 'Contact Advisory Desk',
          url: 'https://serikaliguide.co.ke/contact',
          isCurrent: true,
        });
        break;

      case 'privacy':
        items.push({
          label: 'Privacy Policy',
          url: 'https://serikaliguide.co.ke/privacy',
          isCurrent: true,
        });
        break;

      case 'terms':
        items.push({
          label: 'Terms of Use',
          url: 'https://serikaliguide.co.ke/terms',
          isCurrent: true,
        });
        break;

      case 'admin':
        items.push({
          label: 'Editorial CMS Admin',
          url: 'https://serikaliguide.co.ke/admin',
          isCurrent: true,
        });
        break;

      case 'wishlist':
        items.push({
          label: 'Saved Dossiers Archive',
          isCurrent: true,
        });
        break;

      case 'client-portal':
        items.push({
          label: 'Client Advisory Portal',
          isCurrent: true,
        });
        break;

      case 'category':
        items.push({
          label: `Catalog · ${route.categoryId}`,
          isCurrent: true,
        });
        break;

      case 'product':
        items.push({
          label: 'Product Details',
          isCurrent: true,
        });
        break;

      case 'compare':
        items.push({
          label: 'Compare Dossiers',
          isCurrent: true,
        });
        break;

      case 'deals':
        items.push({
          label: 'Special Advisories',
          isCurrent: true,
        });
        break;

      case 'info':
        items.push({
          label: `Information · ${route.section}`,
          isCurrent: true,
        });
        break;

      default:
        items.push({
          label: 'Page Not Found',
          isCurrent: true,
        });
        break;
    }

    return items;
  }, [route, serviceCategories, blogPosts, navigate]);

  // Synchronize Schema.org BreadcrumbList JSON-LD into document head
  useEffect(() => {
    if (breadcrumbs.length <= 1) {
      const existing = document.getElementById('serikali-breadcrumb-ld');
      if (existing) existing.remove();
      return;
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: crumb.label,
        item: crumb.url || 'https://serikaliguide.co.ke/',
      })),
    };

    let scriptTag = document.getElementById(
      'serikali-breadcrumb-ld'
    ) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'serikali-breadcrumb-ld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaData);

    return () => {
      // Keep script updated or cleanup on unmount
    };
  }, [breadcrumbs]);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb Navigation"
      className="bg-[#F4F3EF] border-b border-[#141413]/10 py-2.5 sm:py-3 transition-colors"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <ol
          className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono-num text-[#6E6D68] list-none p-0 m-0"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <li
                key={`${crumb.label}-${idx}`}
                className="flex items-center gap-1.5 sm:gap-2 min-w-0"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {idx === 0 && (
                  <Home
                    className="w-3.5 h-3.5 text-[#141413]/60 shrink-0 mb-0.5"
                    aria-hidden="true"
                  />
                )}

                {isLast ? (
                  <span
                    aria-current="page"
                    itemProp="name"
                    title={crumb.label}
                    className="text-[#141413] font-semibold truncate max-w-[220px] sm:max-w-md"
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={crumb.onClick}
                    itemProp="item"
                    title={`Navigate to ${crumb.label}`}
                    className="hover:text-[#141413] hover:underline cursor-pointer transition-colors truncate max-w-[160px] sm:max-w-[240px] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#141413]"
                  >
                    <span itemProp="name">{crumb.label}</span>
                  </button>
                )}

                <meta itemProp="position" content={String(idx + 1)} />

                {!isLast && (
                  <ChevronRight
                    className="w-3 h-3 text-[#141413]/30 shrink-0"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
