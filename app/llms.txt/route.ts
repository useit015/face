import { llmsTxt } from "@/lib/llms";

export const dynamic = "force-static";

export function GET() {
  return new Response(llmsTxt(), {
    // For AI crawlers, not search results: kept out of the index so a
    // plain-text copy of the page never competes with the page itself.
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex" },
  });
}
