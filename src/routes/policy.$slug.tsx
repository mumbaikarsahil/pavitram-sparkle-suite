import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/policy/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${titleize(params.slug)} — Pavitram` },
      { name: "description", content: `Pavitram Diamond Jewellery — ${titleize(params.slug)}.` },
    ],
    links: [{ rel: "canonical", href: `/policy/${params.slug}` }],
  }),
  component: PolicyPage,
});

function titleize(s: string) { return s.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join(" "); }

function PolicyPage() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["page", slug],
    queryFn: async () => (await supabase.from("pages").select("*").eq("slug", slug).maybeSingle()).data,
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !data ? (
        <div>
          <h1 className="font-serif text-3xl">Page not found</h1>
          <p className="mt-2 text-muted-foreground">We couldn't find that page. <Link to="/" className="text-[color:var(--plum)] underline">Back home</Link>.</p>
        </div>
      ) : (
        <article>
          <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--plum)]">Pavitram</p>
          <h1 className="font-serif text-4xl mt-3">{data.title}</h1>
          <div className="gold-divider w-24 mt-3 mb-8" />
          <div className="prose prose-sm md:prose-base max-w-none text-foreground/85 leading-relaxed whitespace-pre-wrap">
            {renderMarkdown(data.body)}
          </div>
        </article>
      )}
    </div>
  );
}

function renderMarkdown(md: string) {
  // light renderer: split paragraphs, handle ## and ### and **bold**
  return md.split(/\n\n+/).map((block, i) => {
    if (block.startsWith("### ")) return <h3 key={i} className="font-serif text-xl mt-8 mb-3">{block.slice(4)}</h3>;
    if (block.startsWith("## ")) return <h2 key={i} className="font-serif text-2xl mt-10 mb-3">{block.slice(3)}</h2>;
    if (block.startsWith("- ")) return (
      <ul key={i} className="list-disc pl-5 my-3 space-y-1.5">
        {block.split("\n").map((l, j) => <li key={j}>{inline(l.replace(/^- /, ""))}</li>)}
      </ul>
    );
    return <p key={i} className="my-3">{inline(block)}</p>;
  });
}
function inline(s: string) {
  const parts = s.split(/\*\*(.+?)\*\*/g);
  return parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : <span key={i}>{p}</span>);
}
