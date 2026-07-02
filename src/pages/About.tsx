import { Link } from 'react-router-dom';
import { Github, Mail, BookOpen, Rss, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { posts } from 'virtual:content';

export function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Profile */}
      <section className="text-center space-y-4">
        <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <BookOpen className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">E'Blog</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          大数据开发工程师，专注于实时数据管线、流式计算与数据基建。
          在这里记录技术踩坑、架构复盘，与志同道合的朋友交流成长。
        </p>
        <div className="flex justify-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
          <a
            href="mailto:hello@example.com"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            <Mail className="h-4 w-4" />
            邮箱
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            <Rss className="h-4 w-4" />
            RSS
          </a>
        </div>
      </section>

      {/* Skills */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">技术栈</h2>
        <div className="flex flex-wrap gap-2">
          {['Java', 'Go', 'Python', 'Flink', 'Kafka', 'Pulsar', 'ClickHouse', 'Doris', 'Iceberg', 'Redis', 'MySQL', 'PostgreSQL', 'Spring', 'SpringBoot', 'MyBatis', 'Kubernetes', 'Helm', 'Docker', 'GitLab CI', 'Linux', 'Claude Code'].map(
            (skill) => (
              <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm">
                {skill}
              </Badge>
            )
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">博客统计</h2>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="text-center py-6">
              <div className="text-3xl font-bold text-primary">{posts.length}</div>
              <div className="text-sm text-muted-foreground mt-1">文章</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-6">
              <div className="text-3xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground mt-1">标签</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-6">
              <div className="text-3xl font-bold text-primary">2025</div>
              <div className="text-sm text-muted-foreground mt-1">始于</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Posts */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">最近文章</h2>
        <div className="space-y-3">
          {posts.slice(0, 3).map((post) => (
            <Link
              key={post.id}
              to={`/article/${post.slug}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="space-y-1">
                <h3 className="font-medium group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground">{post.date}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
