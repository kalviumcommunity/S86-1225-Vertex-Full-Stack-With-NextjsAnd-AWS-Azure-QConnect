import sanitizeHtml from "sanitize-html";

export function sanitizeInput(input: any): any {
  if (input == null) return input;
  if (typeof input === "string") {
    // remove all HTML tags by default and trim whitespace
    return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} }).trim();
  }
  if (Array.isArray(input)) return input.map(sanitizeInput);
  if (typeof input === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(input)) {
      out[k] = sanitizeInput(v);
    }
    return out;
  }
  return input;
}

export function sanitizeAllowHtml(input: string): string {
  // If you need to allow some safe HTML (e.g., limited formatting), configure allowedTags
  return sanitizeHtml(input, {
    allowedTags: ["b", "i", "em", "strong", "a", "p", "ul", "ol", "li"],
    allowedAttributes: {
      a: ["href", "title", "rel", "target"],
    },
    transformTags: {
      a: (tagName, attribs) => ({ tagName: "a", attribs: { ...attribs, rel: "noopener noreferrer" } }),
    },
  }).trim();
}
