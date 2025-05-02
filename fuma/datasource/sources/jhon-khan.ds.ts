import {Context} from "../shared";
import {addRSSPage, dateFolderTransformer} from "../transformer";

export default (ctx: Context) => ({
  id: 'archive.john-khan',
  mountedPath: '/docs/john-khan',
  category: [],
  name: '小约翰可汗',
  icon: "/image/john-khan.png",
  description: "谁是周更up？！说话！look at me！",
  provider: {
    type: 'unstorage',
    driver: 'github' as const,
    options: { repo: "mdark-org/bili-john-khan", branch: "main", dir: "/docs/john-khan", token: ctx.env.GITHUB_TOKEN },
    includes: ['*.md', '*.mdx'],
  },
  github: { repo: "mdark-org/bili-john-khan", branch: "main", dir: "/docs/john-khan" },
  transformers: {
    root: [ addRSSPage(`${ctx.env.BASE_URL}/rss/john-khan`) ],

  }
})