import {source} from "@/lib/source";

export async function GET(request: Request, {
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const category = decodeURIComponent((await params).category);
  const feed = await source.generateRSS(category)
  if(!feed) {
    return new Response('404 not found', {
      headers: { 'content-type': 'text/plain' },
      status: 404
    })
  }
  return new Response(feed.rss2(), {
    headers: {
      'content-type': 'application/xml',
    },
  })
}
