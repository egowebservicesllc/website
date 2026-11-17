import { Link, useParams } from "wouter";
import { ArrowRight, ArrowLeft, Clock, CheckCircle2 } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { BLOG_POSTS, findPost, type BlogPost } from "@/lib/blog";
import NotFound from "@/pages/not-found";

const fmtDate = (iso: string) =>
  new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

const isInternal = (href: string) => href.startsWith("/");

function CtaLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return isInternal(href) && !href.includes("?") ? (
    <Link href={href} className={className}>{children}</Link>
  ) : (
    <a href={href} className={className}>{children}</a>
  );
}

/** /blog: list of articles */
export function BlogIndex() {
  return (
    <Layout>
      <Seo path="/blog" />
      <section className="bg-slate-50 pt-20 pb-12 md:pt-24 md:pb-16 border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Guides</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 text-balance">Cloud, hosting &amp; web guides</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Plain-English answers from our engineers to the questions clients ask us most: what things cost, which platform to choose, and how to avoid expensive mistakes.
          </p>
        </div>
      </section>
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl grid gap-6 md:grid-cols-2">
          {BLOG_POSTS.map((p, i) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className={`group block bg-white rounded-3xl border border-slate-200 p-7 md:p-8 hover:border-primary/40 hover:shadow-lg transition-all ${i === 0 ? "md:col-span-2" : ""}`}>
              <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                <span className="rounded-full bg-primary/10 text-primary font-semibold px-3 py-0.5">{p.topic}</span>
                <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" /> {p.readMins} min read</span>
              </div>
              <h2 className={`font-extrabold text-slate-900 group-hover:text-primary transition-colors text-balance ${i === 0 ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"}`}>{p.title}</h2>
              <p className="text-slate-600 mt-3">{p.excerpt}</p>
              <span className="mt-5 inline-flex items-center gap-2 font-semibold text-primary">Read the guide <ArrowRight className="w-4 h-4" /></span>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
}

function Article({ post }: { post: BlogPost }) {
  const others = BLOG_POSTS.filter((p) => p.slug !== post.slug);
  return (
    <Layout>
      <Seo path={`/blog/${post.slug}`} />
      <article>
        <header className="bg-slate-50 pt-16 pb-10 md:pt-20 md:pb-14 border-b border-slate-200">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-6">
              <Link href="/" className="hover:text-primary">Home</Link> <span aria-hidden="true">/</span>{" "}
              <Link href="/blog" className="hover:text-primary">Blog</Link>
            </nav>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight text-balance">{post.title}</h1>
            <p className="mt-5 text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>By the EGO Web Services engineering team</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.date}>{fmtDate(post.date)}</time>
              <span aria-hidden="true">·</span>
              <span>{post.readMins} min read</span>
            </p>
          </div>
        </header>

        <div className="container mx-auto px-4 md:px-6 max-w-3xl py-12 md:py-16">
          <div className="prose prose-slate prose-lg max-w-none prose-headings:font-extrabold prose-headings:text-slate-900 prose-a:text-primary prose-li:my-1">
            {post.intro.map((p, i) => <p key={i}>{p}</p>)}
            {post.sections.map((s) => (
              <section key={s.h}>
                <h2>{s.h}</h2>
                {s.paras?.map((p, i) => <p key={i}>{p}</p>)}
                {s.table && (
                  <div className="not-prose overflow-x-auto my-6 rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-[15px]">
                      <thead className="bg-slate-50 text-slate-900">
                        <tr>{s.table.head.map((h, i) => <th key={i} className="px-4 py-3 font-bold whitespace-nowrap">{h}</th>)}</tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {s.table.rows.map((r, i) => (
                          <tr key={i}>{r.map((c, j) => <td key={j} className={`px-4 py-3 align-top ${j === 0 ? "font-semibold text-slate-900" : "text-slate-700"}`}>{c}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {s.list && (
                  <ul className="not-prose my-5 space-y-3">
                    {s.list.map((li, i) => (
                      <li key={i} className="flex gap-3 text-slate-700 text-[17px] leading-relaxed"><CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" /><span>{li}</span></li>
                    ))}
                  </ul>
                )}
                {s.note && <p>{s.note}</p>}
              </section>
            ))}

            <h2>Frequently asked questions</h2>
            {post.faq.map((f) => (
              <div key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>

          <Link
            href={post.topic === "Cloud" ? "/cloud-migration-checklist" : "/free-website-check"}
            className="mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-blue-100 bg-blue-50 p-6 md:p-8 hover:border-primary/40 transition-colors"
          >
            <span>
              <span className="block text-sm font-semibold uppercase tracking-widest text-primary mb-1">Free</span>
              <span className="block text-lg md:text-xl font-bold text-slate-900">
                {post.topic === "Cloud" ? "Get our free 40-point cloud migration checklist" : "Get a free speed, SEO and mobile check of your website"}
              </span>
            </span>
            <span className="inline-flex items-center gap-2 font-semibold text-primary shrink-0">{post.topic === "Cloud" ? "Get the checklist" : "Check my site"} <ArrowRight className="w-4 h-4" /></span>
          </Link>

          <aside className="mt-12 rounded-3xl bg-primary text-white p-8 md:p-10">
            <p className="text-xl md:text-2xl font-bold text-balance">{post.cta.text}</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button asChild className="rounded-full h-12 px-7 bg-white text-primary hover:bg-slate-100">
                <CtaLink href={post.cta.href}>{post.cta.label} <ArrowRight className="w-4 h-4 ml-2" /></CtaLink>
              </Button>
              <Button asChild variant="outline" className="rounded-full h-12 px-7 bg-transparent text-white border-white/60 hover:bg-white/10 hover:text-white">
                <Link href="/contact">Ask an engineer</Link>
              </Button>
            </div>
          </aside>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-3">Related services</h2>
              <ul className="space-y-2">
                {post.related.map((r) => (
                  <li key={r.href}><Link href={r.href} className="text-primary font-semibold hover:underline">{r.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-3">More guides</h2>
              <ul className="space-y-2">
                {others.map((o) => (
                  <li key={o.slug}><Link href={`/blog/${o.slug}`} className="text-primary font-semibold hover:underline">{o.title}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          <Link href="/blog" className="mt-12 inline-flex items-center gap-2 text-slate-600 hover:text-primary font-semibold"><ArrowLeft className="w-4 h-4" /> All guides</Link>
        </div>
      </article>
    </Layout>
  );
}

/** /blog/:slug */
export function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const post = findPost(params.slug || "");
  return post ? <Article post={post} /> : <NotFound />;
}
