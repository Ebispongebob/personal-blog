import { Link, useSearchParams } from 'react-router-dom';
import { Tag, Calendar, Clock, Hash } from 'lucide-react';
import { posts, getAllTags, getPostsByTag } from 'virtual:content';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function Tags() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTag = searchParams.get('tag') || '';

  const allTags = getAllTags();
  const filteredPosts = selectedTag ? getPostsByTag(selectedTag) : posts;

  const tagCounts: Record<string, number> = {};
  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
        <Hash className="h-7 w-7" />
        标签分类
      </h1>

      {/* Tags List */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Tag className="h-4 w-4" />
          全部标签
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSearchParams({})}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !selectedTag
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            全部 ({posts.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchParams({ tag })}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedTag === tag
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tag} ({tagCounts[tag] || 0})
            </button>
          ))}
        </div>
      </section>

      {/* Filtered Posts */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          {selectedTag ? `「${selectedTag}」相关文章` : '全部文章'}
          <span className="text-muted-foreground text-sm font-normal ml-2">
            共 {filteredPosts.length} 篇
          </span>
        </h2>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            该标签下暂无文章
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <Link to={`/article/${post.slug}`} className="block">
                    <h3 className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
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
                        <Badge
                          key={tag}
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 cursor-pointer hover:bg-muted ${
                            selectedTag === tag ? 'bg-primary/10 text-primary border-primary/30' : ''
                          }`}
                          onClick={() => setSearchParams({ tag })}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
