import React, { useMemo } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";

interface SEOAnalysisProps {
    title: string;
    description: string;
    content: string;
    slug: string;
    keywords: string[];
    tags: string[];
    featuredImage: File | null;
}

interface SEOCheck {
    id: string;
    label: string;
    status: "good" | "warning" | "error" | "info";
    message: string;
    priority: number;
}

const stripHtml = (html: string): string => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
};

const countWords = (text: string): number => {
    return stripHtml(text).split(/\s+/).filter(Boolean).length;
};

const SEOAnalysis: React.FC<SEOAnalysisProps> = ({
    title,
    description,
    content,
    slug,
    keywords,
    tags,
    featuredImage,
}) => {
    const checks = useMemo((): SEOCheck[] => {
        const results: SEOCheck[] = [];
        const plainContent = stripHtml(content);
        const wordCount = countWords(content);
        const focusKeyword = keywords[0]?.toLowerCase() || "";

        // Title checks
        if (!title) {
            results.push({
                id: "title-missing",
                label: "Title",
                status: "error",
                message: "Add a title to your post",
                priority: 1,
            });
        } else if (title.length < 30) {
            results.push({
                id: "title-short",
                label: "Title Length",
                status: "warning",
                message: `Title is too short (${title.length} chars). Aim for 50-60 characters.`,
                priority: 2,
            });
        } else if (title.length > 60) {
            results.push({
                id: "title-long",
                label: "Title Length",
                status: "warning",
                message: `Title is too long (${title.length} chars). Keep it under 60 characters for search results.`,
                priority: 2,
            });
        } else {
            results.push({
                id: "title-good",
                label: "Title Length",
                status: "good",
                message: `Title length is optimal (${title.length} chars)`,
                priority: 2,
            });
        }

        // Check if focus keyword is in title
        if (focusKeyword && title.toLowerCase().includes(focusKeyword)) {
            results.push({
                id: "title-keyword",
                label: "Keyword in Title",
                status: "good",
                message: "Focus keyword appears in the title",
                priority: 3,
            });
        } else if (focusKeyword) {
            results.push({
                id: "title-keyword-missing",
                label: "Keyword in Title",
                status: "warning",
                message: "Consider adding your focus keyword to the title",
                priority: 3,
            });
        }

        // Meta description checks
        if (!description) {
            results.push({
                id: "desc-missing",
                label: "Meta Description",
                status: "error",
                message: "Add a meta description for better SEO",
                priority: 1,
            });
        } else if (description.length < 120) {
            results.push({
                id: "desc-short",
                label: "Meta Description",
                status: "warning",
                message: `Description is short (${description.length} chars). Aim for 150-160 characters.`,
                priority: 2,
            });
        } else if (description.length > 160) {
            results.push({
                id: "desc-long",
                label: "Meta Description",
                status: "warning",
                message: `Description may be truncated (${description.length} chars). Keep it under 160 characters.`,
                priority: 2,
            });
        } else {
            results.push({
                id: "desc-good",
                label: "Meta Description",
                status: "good",
                message: `Meta description length is optimal (${description.length} chars)`,
                priority: 2,
            });
        }

        // Check if focus keyword is in description
        if (focusKeyword && description.toLowerCase().includes(focusKeyword)) {
            results.push({
                id: "desc-keyword",
                label: "Keyword in Description",
                status: "good",
                message: "Focus keyword appears in the meta description",
                priority: 3,
            });
        } else if (focusKeyword && description) {
            results.push({
                id: "desc-keyword-missing",
                label: "Keyword in Description",
                status: "info",
                message: "Consider adding your focus keyword to the meta description",
                priority: 4,
            });
        }

        // Slug checks
        if (!slug) {
            results.push({
                id: "slug-missing",
                label: "URL Slug",
                status: "error",
                message: "Add a URL slug for your post",
                priority: 1,
            });
        } else if (slug.length > 75) {
            results.push({
                id: "slug-long",
                label: "URL Slug",
                status: "warning",
                message: "URL slug is quite long. Shorter URLs tend to perform better.",
                priority: 3,
            });
        } else if (focusKeyword && slug.includes(focusKeyword.replace(/\s+/g, "-"))) {
            results.push({
                id: "slug-keyword",
                label: "URL Slug",
                status: "good",
                message: "Focus keyword appears in the URL",
                priority: 3,
            });
        } else {
            results.push({
                id: "slug-ok",
                label: "URL Slug",
                status: "good",
                message: "URL slug looks SEO-friendly",
                priority: 3,
            });
        }

        // Content length checks
        if (!content || wordCount === 0) {
            results.push({
                id: "content-missing",
                label: "Content",
                status: "error",
                message: "Add content to your post",
                priority: 1,
            });
        } else if (wordCount < 300) {
            results.push({
                id: "content-short",
                label: "Content Length",
                status: "error",
                message: `Content is too short (${wordCount} words). Aim for at least 300 words.`,
                priority: 1,
            });
        } else if (wordCount < 600) {
            results.push({
                id: "content-medium",
                label: "Content Length",
                status: "warning",
                message: `Content length is okay (${wordCount} words). 600+ words recommended for SEO.`,
                priority: 2,
            });
        } else if (wordCount < 1000) {
            results.push({
                id: "content-good",
                label: "Content Length",
                status: "good",
                message: `Good content length (${wordCount} words)`,
                priority: 2,
            });
        } else {
            results.push({
                id: "content-excellent",
                label: "Content Length",
                status: "good",
                message: `Excellent content length (${wordCount} words). Long-form content ranks well!`,
                priority: 2,
            });
        }

        // Keyword in content
        if (focusKeyword && plainContent.toLowerCase().includes(focusKeyword)) {
            const keywordCount = (plainContent.toLowerCase().match(new RegExp(focusKeyword, "g")) || []).length;
            const density = ((keywordCount / wordCount) * 100).toFixed(1);
            
            if (parseFloat(density) > 3) {
                results.push({
                    id: "keyword-stuffing",
                    label: "Keyword Density",
                    status: "warning",
                    message: `Keyword density is high (${density}%). Avoid keyword stuffing.`,
                    priority: 3,
                });
            } else if (parseFloat(density) < 0.5 && wordCount > 100) {
                results.push({
                    id: "keyword-low",
                    label: "Keyword Density",
                    status: "info",
                    message: `Keyword density is low (${density}%). Consider using your keyword more naturally.`,
                    priority: 4,
                });
            } else {
                results.push({
                    id: "keyword-good",
                    label: "Keyword Density",
                    status: "good",
                    message: `Keyword density is good (${density}%)`,
                    priority: 3,
                });
            }
        } else if (focusKeyword && wordCount > 50) {
            results.push({
                id: "keyword-content-missing",
                label: "Keyword in Content",
                status: "warning",
                message: "Focus keyword doesn't appear in your content",
                priority: 2,
            });
        }

        // Headings check
        const h2Count = (content.match(/<h2/gi) || []).length;
        const h3Count = (content.match(/<h3/gi) || []).length;
        
        if (wordCount > 300 && h2Count === 0) {
            results.push({
                id: "headings-missing",
                label: "Subheadings",
                status: "warning",
                message: "Add H2 subheadings to structure your content",
                priority: 3,
            });
        } else if (h2Count > 0) {
            results.push({
                id: "headings-good",
                label: "Subheadings",
                status: "good",
                message: `Content has ${h2Count} H2 and ${h3Count} H3 headings`,
                priority: 3,
            });
        }

        // Internal/External links
        const linkCount = (content.match(/<a /gi) || []).length;
        if (wordCount > 300 && linkCount === 0) {
            results.push({
                id: "links-missing",
                label: "Links",
                status: "info",
                message: "Consider adding internal or external links",
                priority: 4,
            });
        } else if (linkCount > 0) {
            results.push({
                id: "links-good",
                label: "Links",
                status: "good",
                message: `Content has ${linkCount} link(s)`,
                priority: 4,
            });
        }

        // Image checks
        if (!featuredImage) {
            results.push({
                id: "image-missing",
                label: "Featured Image",
                status: "warning",
                message: "Add a featured image for better engagement",
                priority: 2,
            });
        } else {
            results.push({
                id: "image-good",
                label: "Featured Image",
                status: "good",
                message: "Featured image is set",
                priority: 2,
            });
        }

        // Image alt text in content
        const imgCount = (content.match(/<img/gi) || []).length;
        const imgWithAlt = (content.match(/<img[^>]+alt=["'][^"']+["']/gi) || []).length;
        
        if (imgCount > 0 && imgWithAlt < imgCount) {
            results.push({
                id: "img-alt-missing",
                label: "Image Alt Text",
                status: "warning",
                message: `${imgCount - imgWithAlt} image(s) missing alt text`,
                priority: 3,
            });
        } else if (imgCount > 0) {
            results.push({
                id: "img-alt-good",
                label: "Image Alt Text",
                status: "good",
                message: "All images have alt text",
                priority: 3,
            });
        }

        // Keywords check
        if (keywords.length === 0) {
            results.push({
                id: "keywords-missing",
                label: "Keywords",
                status: "warning",
                message: "Add focus keywords for better targeting",
                priority: 2,
            });
        } else if (keywords.length < 3) {
            results.push({
                id: "keywords-few",
                label: "Keywords",
                status: "info",
                message: `Only ${keywords.length} keyword(s). Consider adding 3-5 relevant keywords.`,
                priority: 3,
            });
        } else {
            results.push({
                id: "keywords-good",
                label: "Keywords",
                status: "good",
                message: `${keywords.length} keywords added`,
                priority: 3,
            });
        }

        // Tags check
        if (tags.length === 0) {
            results.push({
                id: "tags-missing",
                label: "Tags",
                status: "info",
                message: "Consider adding tags for better categorization",
                priority: 4,
            });
        } else {
            results.push({
                id: "tags-good",
                label: "Tags",
                status: "good",
                message: `${tags.length} tag(s) added`,
                priority: 4,
            });
        }

        // Sort by priority and status
        const statusOrder = { error: 0, warning: 1, info: 2, good: 3 };
        return results.sort((a, b) => {
            if (statusOrder[a.status] !== statusOrder[b.status]) {
                return statusOrder[a.status] - statusOrder[b.status];
            }
            return a.priority - b.priority;
        });
    }, [title, description, content, slug, keywords, tags, featuredImage]);

    const score = useMemo(() => {
        const weights = { good: 10, info: 5, warning: 3, error: 0 };
        const totalPossible = checks.length * 10;
        const earned = checks.reduce((sum, check) => sum + weights[check.status], 0);
        return Math.round((earned / totalPossible) * 100);
    }, [checks]);

    const getScoreColor = () => {
        if (score >= 80) return "text-green-600 dark:text-green-400";
        if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
        if (score >= 40) return "text-orange-600 dark:text-orange-400";
        return "text-red-600 dark:text-red-400";
    };

    const getScoreBg = () => {
        if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
        if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
        if (score >= 40) return "bg-orange-100 dark:bg-orange-900/30";
        return "bg-red-100 dark:bg-red-900/30";
    };

    const getIcon = (status: string) => {
        switch (status) {
            case "good":
                return <CheckCircleIcon className="text-green-500" fontSize="small" />;
            case "warning":
                return <WarningIcon className="text-yellow-500" fontSize="small" />;
            case "error":
                return <ErrorIcon className="text-red-500" fontSize="small" />;
            case "info":
                return <InfoIcon className="text-blue-500" fontSize="small" />;
            default:
                return null;
        }
    };

    const goodCount = checks.filter((c) => c.status === "good").length;
    const warningCount = checks.filter((c) => c.status === "warning").length;
    const errorCount = checks.filter((c) => c.status === "error").length;

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className={`p-4 ${getScoreBg()}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">SEO Analysis</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {goodCount} good • {warningCount} improvements • {errorCount} issues
                        </p>
                    </div>
                    <div className={`text-3xl font-bold ${getScoreColor()}`}>
                        {score}%
                    </div>
                </div>
                <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${
                            score >= 80
                                ? "bg-green-500"
                                : score >= 60
                                ? "bg-yellow-500"
                                : score >= 40
                                ? "bg-orange-500"
                                : "bg-red-500"
                        }`}
                        style={{ width: `${score}%` }}
                    />
                </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto">
                {checks.map((check) => (
                    <div
                        key={check.id}
                        className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                        <div className="flex-shrink-0 mt-0.5">{getIcon(check.status)}</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {check.label}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {check.message}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SEOAnalysis;
