import { Meta as meta } from "../redux/slices/globalSlice";

const KEYWORDS = "tech, programming, food, lifestyle, economy, content creation, videos";
const POST_FIX_TITLE = " - EliteBlog";

const Meta = ({ meta }: { meta: meta }) => {
    const metaTitle = meta.addPostFixTitle ? `${meta.title}${POST_FIX_TITLE}` : meta.title;
    const featuredImageUrl = `${import.meta.env.VITE_API_URL}/feeds/${meta?.featuredImage}`;
    
    return (
        <>
            <title>{metaTitle || "EliteBlog - The Best Content"}</title>
            {meta.noIndex && <meta name="robots" content="noindex, nofollow" />}
            <meta name="description" content={meta?.description} />
            <meta name="keywords" content={`${KEYWORDS}, ${meta?.keywords?.join(", ")}`} />
            <meta name="author" content={meta?.author?.name || meta?.author?.username} />
            <meta name="category" content={meta?.category?.name} />
            <link rel="canonical" href={meta?.schema?.mainEntityOfPage["@id"]} />
            
            {/* Open Graph Meta Tags for Facebook, LinkedIn, WhatsApp, Telegram */}
            <meta property="og:type" content="article" />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={meta?.description} />
            <meta property="og:url" content={meta?.schema?.mainEntityOfPage["@id"]} />
            <meta property="og:site_name" content="EliteBlog" />
            <meta property="og:image" content={featuredImageUrl} />
            <meta property="og:image:alt" content={meta?.title} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="article:published_time" content={meta?.publishedTime} />
            <meta property="article:modified_time" content={meta?.modifiedTime} />
            
            {/* Twitter Card Meta Tags */}
            <meta name="twitter:card" content={meta.largeTwitterCard ? "summary_large_image" : "summary"} />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={meta?.description} />
            <meta name="twitter:image" content={featuredImageUrl} />
            <meta name="twitter:image:alt" content={meta?.title} />
            <meta name="twitter:site" content="@EliteCodec" />
            <meta name="twitter:creator" content="@EliteCodec" />
            
            {/* WhatsApp & Telegram Meta Tags */}
            <meta property="whatsapp:title" content={metaTitle} />
            <meta property="whatsapp:description" content={meta?.description} />
            <meta property="whatsapp:image" content={featuredImageUrl} />
            <meta name="telegram:title" content={metaTitle} />
            <meta name="telegram:description" content={meta?.description} />
            <meta name="telegram:image" content={featuredImageUrl} />
            
            {/* Structured Data for SEO */}
            {meta.schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(meta.schema) }}
                />
            )}
        </>
    );
};

export default Meta;
