import { useEffect } from "react";
import { useLocation } from "react-router-dom";
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

interface MetaProps {
    addPostFixTitle?: boolean;
    noIndex?: boolean;
    title?: string;
    description?: string;
    featuredImage?: string;
    category?: {
        id?: string;
        name: string;
    };
    keywords?: string[];
    tags?: string[];
    author?: {
        id?: string;
        name?: string;
        username?: string;
        avatarUrl?: string;
    };
    schema?: {
        mainEntityOfPage: {
            "@id": string;
        };
        datePublished?: string;
        dateModified?: string;
    };
    largeTwitterCard?: boolean;
    modifiedTime?: string;
    publishedTime?: string;
    content?: string;
    slug?: string;
    type?: "website" | "article" | "profile";
    breadcrumbs?: BreadcrumbItem[];
}

const updateMetaTag = (selector: string, content: string | undefined, attribute = "content") => {
    if (!content) return;
    let element = document.querySelector(selector) as HTMLMetaElement | HTMLLinkElement;
    if (!element) {
        const isLink = selector.includes('rel=');
        element = document.createElement(isLink ? "link" : "meta") as HTMLMetaElement | HTMLLinkElement;
        
        const attrMatch = selector.match(/\[([^\]]+)\]/g);
        attrMatch?.forEach(attr => {
            const [key, value] = attr.slice(1, -1).split('=');
            element.setAttribute(key, value?.replace(/"/g, '') || '');
        });
        
        document.head.appendChild(element);
    }
    element.setAttribute(attribute, content);
};

const removeMetaTag = (selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
        element.remove();
    }
};

const setJsonLd = (id: string, data: object | null) => {
    const existingScript = document.querySelector(`script[data-schema-id="${id}"]`);
    if (existingScript) {
        existingScript.remove();
    }
    
    if (data) {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-schema-id", id);
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    }
};

const Meta = ({ meta }: { meta: MetaProps }) => {
    const location = useLocation();
    const isArticle = meta.type === "article" || !!meta.schema?.mainEntityOfPage;

    const metaTitle = meta.title
        ? meta.addPostFixTitle !== false
            ? `${meta.title} - ${SEO_CONFIG.siteName}`
            : meta.title
        : SEO_CONFIG.defaultTitle;

    const metaDescription = truncateDescription(
        meta.description || SEO_CONFIG.defaultDescription,
        160
    );

    const canonicalUrl = meta.schema?.mainEntityOfPage?.["@id"] || 
        generateCanonicalUrl(meta.slug || location.pathname);

    const featuredImageUrl = meta.featuredImage
        ? meta.featuredImage.startsWith("http")
            ? meta.featuredImage
            : `${import.meta.env.VITE_API_URL}/uploads/feeds/${meta.featuredImage}`
        : `${SEO_CONFIG.siteUrl}${SEO_CONFIG.defaultImage}`;

    const keywords = [
        ...(meta.keywords || []),
        ...(meta.tags || []),
        ...SEO_CONFIG.defaultKeywords,
    ].filter(Boolean).slice(0, 10).join(", ");

    const wordCount = meta.content ? countWords(meta.content) : undefined;
    const _readingTime = meta.content ? calculateReadingTime(meta.content) : undefined;
    void _readingTime; // Suppress unused variable warning - kept for potential future use

    useEffect(() => {
        document.title = metaTitle;

        updateMetaTag('meta[name="description"]', metaDescription);
        updateMetaTag('meta[name="keywords"]', keywords);
        updateMetaTag('meta[name="author"]', meta.author?.name || SEO_CONFIG.author.name);
        updateMetaTag('link[rel="canonical"]', canonicalUrl, "href");

        if (meta.noIndex) {
            updateMetaTag('meta[name="robots"]', "noindex, nofollow");
        } else {
            updateMetaTag('meta[name="robots"]', "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
        }

        updateMetaTag('meta[property="og:type"]', isArticle ? "article" : "website");
        updateMetaTag('meta[property="og:title"]', metaTitle);
        updateMetaTag('meta[property="og:description"]', metaDescription);
        updateMetaTag('meta[property="og:url"]', canonicalUrl);
        updateMetaTag('meta[property="og:site_name"]', SEO_CONFIG.siteName);
        updateMetaTag('meta[property="og:image"]', featuredImageUrl);
        updateMetaTag('meta[property="og:image:secure_url"]', featuredImageUrl);
        updateMetaTag('meta[property="og:image:alt"]', meta.title || SEO_CONFIG.siteName);
        updateMetaTag('meta[property="og:image:width"]', "1200");
        updateMetaTag('meta[property="og:image:height"]', "630");
        updateMetaTag('meta[property="og:image:type"]', "image/jpeg");
        updateMetaTag('meta[property="og:locale"]', SEO_CONFIG.locale);

        if (isArticle) {
            updateMetaTag('meta[property="article:published_time"]', meta.publishedTime || meta.schema?.datePublished);
            updateMetaTag('meta[property="article:modified_time"]', meta.modifiedTime || meta.schema?.dateModified);
            updateMetaTag('meta[property="article:author"]', meta.author?.name);
            updateMetaTag('meta[property="article:section"]', meta.category?.name);
            meta.tags?.forEach((tag, index) => {
                updateMetaTag(`meta[property="article:tag"][data-index="${index}"]`, tag);
            });
        }

        updateMetaTag('meta[name="twitter:card"]', meta.largeTwitterCard !== false ? "summary_large_image" : "summary");
        updateMetaTag('meta[name="twitter:site"]', SEO_CONFIG.twitterHandle);
        updateMetaTag('meta[name="twitter:creator"]', SEO_CONFIG.twitterHandle);
        updateMetaTag('meta[name="twitter:title"]', metaTitle);
        updateMetaTag('meta[name="twitter:description"]', metaDescription);
        updateMetaTag('meta[name="twitter:image"]', featuredImageUrl);
        updateMetaTag('meta[name="twitter:image:alt"]', meta.title || SEO_CONFIG.siteName);

        updateMetaTag('meta[name="theme-color"]', SEO_CONFIG.themeColor);
        updateMetaTag('meta[name="msapplication-TileColor"]', SEO_CONFIG.themeColor);

        if (isArticle && meta.author && meta.schema) {
            const articleSchema = generateArticleSchema({
                title: meta.title || "",
                description: stripHtml(meta.description || ""),
                url: canonicalUrl,
                image: featuredImageUrl,
                datePublished: meta.publishedTime || meta.schema.datePublished || new Date().toISOString(),
                dateModified: meta.modifiedTime || meta.schema.dateModified || new Date().toISOString(),
                author: {
                    name: meta.author.name || meta.author.username || "Unknown",
                    url: `${SEO_CONFIG.siteUrl}/author/${meta.author.id || meta.author.username}`,
                    image: meta.author.avatarUrl,
                },
                category: meta.category?.name,
                tags: meta.tags,
                wordCount,
            });
            setJsonLd("article", articleSchema);
        } else {
            setJsonLd("article", null);
        }

        if (meta.breadcrumbs && meta.breadcrumbs.length > 0) {
            const breadcrumbSchema = generateBreadcrumbSchema(meta.breadcrumbs);
            setJsonLd("breadcrumb", breadcrumbSchema);
        } else if (isArticle) {
            const defaultBreadcrumbs: BreadcrumbItem[] = [
                { name: "Home", url: SEO_CONFIG.siteUrl },
            ];
            if (meta.category?.name) {
                defaultBreadcrumbs.push({
                    name: meta.category.name,
                    url: `${SEO_CONFIG.siteUrl}/feed/category/${meta.category.name.toLowerCase()}`,
                });
            }
            if (meta.title) {
                defaultBreadcrumbs.push({
                    name: meta.title,
                    url: canonicalUrl,
                });
            }
            const breadcrumbSchema = generateBreadcrumbSchema(defaultBreadcrumbs);
            setJsonLd("breadcrumb", breadcrumbSchema);
        }

        return () => {
            removeMetaTag('meta[property="article:published_time"]');
            removeMetaTag('meta[property="article:modified_time"]');
            removeMetaTag('meta[property="article:author"]');
            removeMetaTag('meta[property="article:section"]');
        };
    }, [
        metaTitle,
        metaDescription,
        canonicalUrl,
        featuredImageUrl,
        keywords,
        meta.noIndex,
        meta.author,
        meta.category,
        meta.tags,
        meta.publishedTime,
        meta.modifiedTime,
        meta.schema,
        meta.breadcrumbs,
        meta.largeTwitterCard,
        isArticle,
        wordCount,
        meta.title,
    ]);

    return null;
};

export default Meta;

export const PageMeta = ({
    title,
    description,
    noIndex = false,
}: {
    title: string;
    description?: string;
    noIndex?: boolean;
}) => {
    return (
        <Meta
            meta={{
                title,
                description,
                noIndex,
                type: "website",
            }}
        />
    );
};

export const ArticleMeta = ({
    title,
    description,
    featuredImage,
    author,
    category,
    tags,
    publishedTime,
    modifiedTime,
    slug,
    content,
}: {
    title: string;
    description: string;
    featuredImage?: string;
    author?: MetaProps["author"];
    category?: MetaProps["category"];
    tags?: string[];
    publishedTime?: string;
    modifiedTime?: string;
    slug?: string;
    content?: string;
}) => {
    const canonicalUrl = generateCanonicalUrl(slug ? `/feed/${slug}` : "");

    return (
        <Meta
            meta={{
                title,
                description,
                featuredImage,
                author,
                category,
                tags,
                keywords: tags,
                publishedTime,
                modifiedTime,
                slug,
                content,
                type: "article",
                largeTwitterCard: true,
                schema: {
                    mainEntityOfPage: { "@id": canonicalUrl },
                    datePublished: publishedTime,
                    dateModified: modifiedTime,
                },
            }}
        />
    );
};
