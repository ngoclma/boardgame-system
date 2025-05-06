export const cleanDescription = (text: string): string => {
  // Create a temporary element to decode HTML entities
  const doc = new DOMParser().parseFromString(text, "text/html");
  let cleanText = doc.body.textContent || "";

  // Replace common XML/HTML entities
  cleanText = cleanText
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#10;/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\n\n+/g, "\n\n"); // Replace multiple newlines with double newline

  return cleanText;
};
