import { useEffect } from "react";
import {
    SEO_CONFIG,
    generateArticleSchema,
    generateBreadcrumbSchema,
    generateCanonicalUrl,
    truncateDescription,
    stripHtml,
    calculateReadingTime,
    countWords,
    BreadcrumbItem,
} from "../utils/seo";

interface UseSEOOptions {
    title?: string;
    description?: string;
    image?: string;
    type?: "website" | "article" | "profile";
    noIndex?: boolean;
    canonicalPath?: string;
    publishedTime?: string;
    modifiedTime?: string;
    author?: {
        name?: string;
        username?: string;
        avatarUrl?: string;
        url?: string;
    };
    category?: string;
    tags?: string[];
    content?: string;
    breadcrumbs?: BreadcrumbItem[];
}

export const useSEO = (options: UseSEOOptions) => {
    const {
        title,
        description,
        image,
        type = "website",
        noIndex = false,
        canonicalPath,
        publishedTime,
        modifiedTime,
        author,
        category,
        tags,
        content,
        breadcrumbs,
    } = options;

    useEffect(() => {
        const fullTitle = title
            ? `${title} - ${SEO_CONFIG.siteName}`
            : SEO_CONFIG.defaultTitle;

        const metaDescription = truncateDescription(
            description || SEO_CONFIG.defaultDescription
        );

        const canonicalUrl = generateCanonicalUrl(canonicalPath || window.location.pathname);

        const imageUrl = image
            ? image.startsWith("http")
                ? image
                : `${import.meta.env.VITE_API_URL}/uploads/feeds/${image}`
            : `${SEO_CONFIG.siteUrl}${SEO_CONFIG.defaultImage}`;

        document.title = fullTitle;

        const updateMeta = (name: string, content: string, isProperty = false) => {
            const selector = isProperty
                ? `meta[property="${name}"]`
                : `meta[name="${name}"]`;
            let element = document.querySelector(selector) as HTMLMetaElement;
            
            if (!element) {
                element = document.createElement("meta");
                element.setAttribute(isProperty ? "property" : "name", name);
                document.head.appendChild(element);
            }
            element.content = content;
        };

        const updateLink = (rel: string, href: string) => {
            let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
            if (!element) {
                element = document.createElement("link");
                element.rel = rel;
                document.head.appendChild(element);
            }
            element.href = href;
        };

        updateMeta("description", metaDescription);
        updateMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");
        updateLink("canonical", canonicalUrl);

        updateMeta("og:type", type === "article" ? "article" : "website", true);
        updateMeta("og:title", fullTitle, true);
        updateMeta("og:description", metaDescription, true);
        updateMeta("og:url", canonicalUrl, true);
        updateMeta("og:image", imageUrl, true);
        updateMeta("og:site_name", SEO_CONFIG.siteName, true);

        updateMeta("twitter:card", "summary_large_image");
        updateMeta("twitter:title", fullTitle);
        updateMeta("twitter:description", metaDescription);
        updateMeta("twitter:image", imageUrl);

        if (type === "article" && publishedTime) {
            updateMeta("article:published_time", publishedTime, true);
        }
        if (type === "article" && modifiedTime) {
            updateMeta("article:modified_time", modifiedTime, true);
        }
        if (author?.name) {
            updateMeta("article:author", author.name, true);
        }
        if (category) {
            updateMeta("article:section", category, true);
        }

        const existingSchemas = document.querySelectorAll('script[type="application/ld+json"][data-dynamic="true"]');
        existingSchemas.forEach(el => el.remove());

        const addSchema = (data: object) => {
            const script = document.createElement("script");
            script.type = "application/ld+json";
            script.setAttribute("data-dynamic", "true");
            script.textContent = JSON.stringify(data);
            document.head.appendChild(script);
        };

        if (type === "article" && title && description) {
            const wordCount = content ? countWords(content) : undefined;
            const articleSchema = generateArticleSchema({
                title,
                description: stripHtml(description),
                url: canonicalUrl,
                image: imageUrl,
                datePublished: publishedTime || new Date().toISOString(),
                dateModified: modifiedTime || new Date().toISOString(),
                author: {
                    name: author?.name || "Unknown",
                    url: author?.url,
                    image: author?.avatarUrl,
                },
                category,
                tags,
                wordCount,
            });
            addSchema(articleSchema);
        }

        if (breadcrumbs && breadcrumbs.length > 0) {
            addSchema(generateBreadcrumbSchema(breadcrumbs));
        }

        return () => {
            const dynamicSchemas = document.querySelectorAll('script[type="application/ld+json"][data-dynamic="true"]');
            dynamicSchemas.forEach(el => el.remove());
        };
    }, [title, description, image, type, noIndex, canonicalPath, publishedTime, modifiedTime, author, category, tags, content, breadcrumbs]);

    return {
        readingTime: content ? calculateReadingTime(content) : 0,
        wordCount: content ? countWords(content) : 0,
    };
};

export const useArticleSEO = (article: {
    title: string;
    description: string;
    slug: string;
    featuredImage?: string;
    content?: string;
    author?: {
        id?: string;
        name?: string;
        username?: string;
        avatarUrl?: string;
    };
    category?: {
        id?: string;
        name: string;
    };
    tags?: string[];
    createdAt?: string;
    updatedAt?: string;
}) => {
    const breadcrumbs: BreadcrumbItem[] = [
        { name: "Home", url: SEO_CONFIG.siteUrl },
    ];

    if (article.category?.name) {
        breadcrumbs.push({
            name: article.category.name,
            url: `${SEO_CONFIG.siteUrl}/feed/category/${article.category.name.toLowerCase()}`,
        });
    }

    breadcrumbs.push({
        name: article.title,
        url: `${SEO_CONFIG.siteUrl}/feed/${article.slug}`,
    });

    return useSEO({
        title: article.title,
        description: article.description,
        image: article.featuredImage,
        type: "article",
        canonicalPath: `/feed/${article.slug}`,
        publishedTime: article.createdAt,
        modifiedTime: article.updatedAt,
        author: article.author
            ? {
                  name: article.author.name || article.author.username,
                  username: article.author.username,
                  avatarUrl: article.author.avatarUrl,
                  url: `${SEO_CONFIG.siteUrl}/author/${article.author.id || article.author.username}`,
              }
            : undefined,
        category: article.category?.name,
        tags: article.tags,
        content: article.content,
        breadcrumbs,
    });
};

export const usePageSEO = (options: {
    title: string;
    description?: string;
    noIndex?: boolean;
}) => {
    return useSEO({
        title: options.title,
        description: options.description,
        noIndex: options.noIndex,
        type: "website",
    });
};

export default useSEO;
