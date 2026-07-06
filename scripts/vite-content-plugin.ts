import type { Plugin } from 'vite';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

interface PostFrontmatter {
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
}

function calculateReadingTime(content: string): string {
  const wordsPerMinute = 300;
  const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
  const totalWords = chineseChars + englishWords;
  const minutes = Math.max(1, Math.round(totalWords / wordsPerMinute));
  return `${minutes} 分钟`;
}

function generateSlug(filename: string): string {
  return filename.replace(/\.md$/, '');
}

export function contentPlugin(): Plugin {
  const virtualModuleId = 'virtual:content';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'vite-plugin-content',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const postsDir = path.resolve(process.cwd(), 'content/posts');

        if (!fs.existsSync(postsDir)) {
          return `
            export const posts = [];
            export function getPostBySlug(slug) { return undefined; }
            export function getAllTags() { return []; }
            export function getPostsByTag(tag) { return []; }
          `;
        }

        const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'));
        const posts = files.map((file) => {
          const filePath = path.join(postsDir, file);
          const raw = fs.readFileSync(filePath, 'utf-8');
          const { data, content } = matter(raw);
          const fm = data as PostFrontmatter;

          return {
            id: generateSlug(file),
            title: fm.title,
            slug: generateSlug(file),
            excerpt: fm.excerpt,
            content: content.trim(),
            date: new Date(fm.date).toISOString().split('T')[0],
            tags: fm.tags,
            readingTime: calculateReadingTime(content),
          };
        });

        // Sort by date descending
        posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const postsJson = JSON.stringify(posts);

        return `
          const posts = ${postsJson};

          export { posts };

          export function getPostBySlug(slug) {
            return posts.find((post) => post.slug === slug);
          }

          export function getAllTags() {
            const tags = new Set();
            posts.forEach((post) => {
              post.tags.forEach((tag) => tags.add(tag));
            });
            return Array.from(tags).sort();
          }

          export function getPostsByTag(tag) {
            return posts.filter((post) => post.tags.includes(tag));
          }
        `;
      }
    },
  };
}
