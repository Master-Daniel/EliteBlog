import axios from 'axios';
import fs from 'fs'

const BASE_URL = 'http://localhost:5173'; // Replace with your actual domain

async function generateSitemap() {
    try {
        const { data } = await axios.get(`http://localhost:3002/api/feed/fetch-all`);
        const blogPosts = data.feeds || [];

        console.log(blogPosts)

        const urls = blogPosts.map(
            (post) => `
            <url>
                <loc>${BASE_URL}/feed/${post.slug}</loc>
                <lastmod>${new Date(post.updated_at).toISOString()}</lastmod>
                <priority>0.8</priority>
            </url>`
        );

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                <url>
                    <loc>${BASE_URL}</loc>
                    <lastmod>${new Date().toISOString()}</lastmod>
                    <priority>1.0</priority>
                </url>
                ${urls.join('')}
            </urlset>`;

        fs.writeFileSync('./public/sitemap.xml', sitemap);
        console.log('✅ Sitemap generated successfully');
    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
    }
}

generateSitemap();
