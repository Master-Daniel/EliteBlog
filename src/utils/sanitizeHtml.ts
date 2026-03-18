import DOMPurify from "dompurify";

/**
 * Sanitizes HTML coming from user-generated content (posts, bios, etc.).
 * This is a security boundary: it prevents stored XSS/phishing overlays.
 */
export function sanitizeHtml(dirtyHtml: string): string {
    // Default DOMPurify config is intentionally conservative.
    // We explicitly allow standard HTML. Scripts/iframes/event-handlers are stripped.
    return DOMPurify.sanitize(dirtyHtml, {
        USE_PROFILES: { html: true },
    });
}

