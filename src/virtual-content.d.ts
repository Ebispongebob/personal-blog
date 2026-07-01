declare module 'virtual:content' {
  export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    date: string;
    tags: string[];
    readingTime: string;
  }

  export const posts: Post[];
  export function getPostBySlug(slug: string): Post | undefined;
  export function getAllTags(): string[];
  export function getPostsByTag(tag: string): Post[];
}
