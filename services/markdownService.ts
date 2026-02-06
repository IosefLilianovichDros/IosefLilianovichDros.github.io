import { POST_IDS } from '../data/posts';

export interface PostMetadata {
  id: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  readingTime: string;
}

export interface PostContent extends PostMetadata {
  content: string;
}

function calculateReadingTime(text: string): string {
  const charCount = text.replace(/[#*`>]/g, '').length;
  const time = Math.ceil(charCount / 400);
  return `${time || 1} min`;
}

function parseMD(id: string, rawText: string): PostContent {
  const frontmatterRegex = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/;
  const match = rawText.match(frontmatterRegex);

  let metadata: any = { id };
  let content = rawText;

  if (match) {
    const yaml = match[1];
    content = match[2];
    yaml.split(/\r?\n/).forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const key = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim().replace(/^['"]|['"]$/g, '');
        if (key === 'tags') {
          metadata[key] = value.replace(/[\[\]]/g, '').split(',').map(t => t.trim());
        } else {
          metadata[key] = value;
        }
      }
    });
  }

  return {
    id,
    title: metadata.title || id,
    date: metadata.date || '2024-01-01',
    description: metadata.description || '',
    tags: metadata.tags || [],
    readingTime: calculateReadingTime(content),
    content: content.trim()
  };
}

export async function getAllPosts(): Promise<PostContent[]> {
  const promises = POST_IDS.map(async (id) => {
    try {
      // 使用相对路径确保 GitHub Pages 兼容性
      const response = await fetch(`./content/${id}.md`);
      if (response.ok) {
        const text = await response.text();
        return parseMD(id, text);
      }
    } catch (e) {
      console.error(`Fetch failed for ${id}`, e);
    }
    return null;
  });

  const results = await Promise.all(promises);
  return results
    .filter((p): p is PostContent => p !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function fetchPostContent(id: string): Promise<PostContent> {
  const isAbout = id === 'about';
  // 使用相对路径确保 GitHub Pages 兼容性
  const path = isAbout ? './about.md' : `./content/${id}.md`;
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error('Not found');
    const rawText = await response.text();
    return parseMD(id, rawText);
  } catch (e) {
    return {
      id: '404',
      title: '未找到内容',
      date: '',
      description: '',
      tags: [],
      readingTime: '0 min',
      content: "# 404\n\n请求的页面不存在。"
    };
  }
}