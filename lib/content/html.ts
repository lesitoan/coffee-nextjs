export type Heading = {
  id: string;
  text: string;
  level: 2 | 3;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export function prepareBlogHtml(html: string) {
  const headings: Heading[] = [];
  const used = new Map<string, number>();

  const preparedHtml = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level, attrs, content) => {
    const existingId = String(attrs).match(/\sid=["']([^"']+)["']/i)?.[1];
    const text = stripTags(content);
    let id = existingId || slugify(text) || `section-heading-${headings.length + 1}`;
    const count = used.get(id) || 0;
    used.set(id, count + 1);
    if (count > 0) id = `${id}-${count + 1}`;

    headings.push({ id, text, level: Number(level) as 2 | 3 });

    if (existingId) return match;
    return `<h${level}${attrs} id="${id}">${content}</h${level}>`;
  });

  return { html: preparedHtml, headings };
}
