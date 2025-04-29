import {addRSSPage, indexFolderTransformer} from "../transformer";
import {Context} from "../shared";

export default (ctx: Context) => ({
    id: 'btnews.opinion',
    name: '高见',
    description: "技术解构旧世界，技术建构新世界",
    mountedPath: '/docs/opinion',
    category: [],
    icon: "/image/opinion.png",
    provider: {
      type: 'unstorage',
      driver: 'github' as const,
      options: { repo: "mdark-org/btnews", branch: "master", dir: "/docs/btnews/opinion", token: ctx.env.GITHUB_TOKEN },
      includes: ['*.md', '*.mdx'],
    },
    github: { repo: "mdark-org/btnews", branch: "master", dir: "/docs/btnews/opinion" },
    transformers: {
      root: [
        addRSSPage(`${ctx.env.BASE_URL}/rss/opinion`),
        indexFolderTransformer
      ],
      folder:[ indexFolderTransformer ]
    }
  })