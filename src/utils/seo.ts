export const SEO_CONFIG = {
    siteName: "EliteBlog",
    siteUrl: import.meta.env.VITE_FRONTEND_URL || "https://elitecodec.com.ng",
    defaultTitle: "EliteBlog - Tech, Programming & Lifestyle Blog",
    defaultDescription: "Discover insightful articles on technology, programming tutorials, web development, and lifestyle tips. Join our community of developers and tech enthusiasts.",
    defaultKeywords: ["tech blog", "programming tutorials", "web development", "software engineering", "coding tips", "javascript", "react", "nodejs", "lifestyle", "tech news"],
    defaultImage: "/images/og-default.jpg",
    twitterHandle: "@EliteCodec",
    locale: "en_US",
    themeColor: "#3b82f6",
    author: {
        name: "EliteBlog Team",
        url: "https://elitecodec.com.ng",
    },
    organization: {
        name: "EliteCodec",
        url: "https://elitecodec.com.ng",
        logo: "https://elitecodec.com.ng/logo.png",
        sameAs: [
            "https://twitter.com/EliteCodec",
            "https://github.com/EliteCodec",
            "https://linkedin.com/company/elitecodec",
        ],
    },
};

export interface ArticleSchema {
    title: string;
    description: string;
    url: string;
    image: string;
    datePublished: string;
    dateModified: string;
    author: {
        id?: string;
        name: string;
        url?: string;
        image?: string;
    };
    publisher?: {
        name: string;
        logo: string;
    };
    category?: string;
    tags?: string[];
    wordCount?: number;
}

export interface BreadcrumbItem {
    name: string;
    url: string;
}

export const generateArticleSchema = (article: ArticleSchema): object => {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${article.url}#article`,
        headline: article.title,
        description: article.description,
        image: {
            "@type": "ImageObject",
            url: article.image,
            width: 1200,
            height: 630,
        },
        datePublished: article.datePublished,
        dateModified: article.dateModified,
        author: {
            "@type": "Person",
            name: article.author.name,
            url: article.author.url || `${SEO_CONFIG.siteUrl}/author/${article.author.id || encodeURIComponent(article.author.name)}`,
            image: article.author.image,
        },
        publisher: {
            "@type": "Organization",
            name: article.publisher?.name || SEO_CONFIG.organization.name,
            logo: {
                "@type": "ImageObject",
                url: article.publisher?.logo || SEO_CONFIG.organization.logo,
            },
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": article.url,
        },
        articleSection: article.category,
        keywords: article.tags?.join(", "),
        wordCount: article.wordCount,
        inLanguage: "en-US",
    };
};

export const generateBreadcrumbSchema = (items: BreadcrumbItem[]): object => {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
};

export const generateOrganizationSchema = (): object => {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${SEO_CONFIG.siteUrl}#organization`,
        name: SEO_CONFIG.organization.name,
        url: SEO_CONFIG.organization.url,
        logo: {
            "@type": "ImageObject",
            url: SEO_CONFIG.organization.logo,
        },
        sameAs: SEO_CONFIG.organization.sameAs,
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
            availableLanguage: ["English"],
        },
    };
};

export const generateWebsiteSchema = (): object => {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SEO_CONFIG.siteUrl}#website`,
        name: SEO_CONFIG.siteName,
        url: SEO_CONFIG.siteUrl,
        description: SEO_CONFIG.defaultDescription,
        publisher: {
            "@id": `${SEO_CONFIG.siteUrl}#organization`,
        },
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${SEO_CONFIG.siteUrl}/search?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
        inLanguage: "en-US",
    };
};

export const generatePersonSchema = (author: {
    name: string;
    url?: string;
    image?: string;
    bio?: string;
    sameAs?: string[];
}): object => {
    return {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": `${author.url || SEO_CONFIG.siteUrl}#person`,
        name: author.name,
        url: author.url,
        image: author.image,
        description: author.bio,
        sameAs: author.sameAs || [],
    };
};

export const generateFAQSchema = (faqs: { question: string; answer: string }[]): object => {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
    };
};

export const truncateDescription = (text: string, maxLength = 160): string => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3).trim() + "...";
};

export const stripHtml = (html: string): string => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
};

export const generateCanonicalUrl = (path: string): string => {
    const baseUrl = SEO_CONFIG.siteUrl.replace(/\/$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
};

export const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = stripHtml(content).split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
};

export const countWords = (content: string): number => {
    return stripHtml(content).split(/\s+/).filter(Boolean).length;
};
