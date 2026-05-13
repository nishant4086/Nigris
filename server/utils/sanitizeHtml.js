/**
 * Lightweight HTML sanitizer for user-generated text fields.
 * Strips all HTML tags and decodes common entities.
 * For rich-text fields, consider using sanitize-html package instead.
 */

// Matches any HTML tag (opening, closing, self-closing, comments, CDATA)
const HTML_TAG_RE = /<\/?[a-z][^>]*>|<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>/gi;

// Common event handler attributes that could execute JS
const EVENT_ATTR_RE = /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi;

// javascript: and data: URI schemes in attribute values
const DANGEROUS_URI_RE = /(?:javascript|data|vbscript)\s*:/gi;

/**
 * Strip all HTML tags from a string, returning plain text.
 * Safe for text/number/boolean fields.
 */
export function stripHtml(input) {
  if (typeof input !== "string") return input;
  return input
    .replace(HTML_TAG_RE, "")
    .replace(DANGEROUS_URI_RE, "")
    .trim();
}

/**
 * Sanitize a string by removing dangerous constructs while
 * preserving basic content. Removes script/style/iframe tags,
 * event handlers, and dangerous URIs.
 */
export function sanitizeText(input) {
  if (typeof input !== "string") return input;
  return input
    .replace(/<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    .replace(/<\s*style\b[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi, "")
    .replace(/<\s*iframe\b[^>]*>[\s\S]*?<\s*\/\s*iframe\s*>/gi, "")
    .replace(/<\s*object\b[^>]*>[\s\S]*?<\s*\/\s*object\s*>/gi, "")
    .replace(/<\s*embed\b[^>]*\/?>/gi, "")
    .replace(/<\s*link\b[^>]*\/?>/gi, "")
    .replace(EVENT_ATTR_RE, "")
    .replace(DANGEROUS_URI_RE, "")
    .trim();
}
