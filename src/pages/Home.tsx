import { Link } from 'react-router-dom';
import { Calendar, Clock, Tag, ArrowRight } from 'lucide-react';
import { posts, getAllTags } from 'virtual:content';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function Home() {
  const allTags = getAllTags();

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="text-center space-y-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">博客主题</h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-base md:text-lg">
          记录技术探索、分享开发心得，在代码的世界里不断前行。
        </p>
      </section>

      {/* Tags Cloud */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Tag className="h-4 w-4" />
          热门标签
        </h2>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <Link key={tag} to={`/tags?tag=${encodeURIComponent(tag)}`}>
              <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      </section>

      {/* Posts List */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">最新文章</h2>
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <Link to={`/article/${post.slug}`} className="block">
                  <h3 className="text-xl font-semibold tracking-tight group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readingTime}
                  </span>
                  <div className="flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" />
                    {post.tags.map((tag) => (
                      <Link key={tag} to={`/tags?tag=${encodeURIComponent(tag)}`}>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 cursor-pointer hover:bg-muted">
                          {tag}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
                <Link
                  to={`/article/${post.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  阅读全文
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
