import { allDocs, allMetas } from "content-collections";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "@fumadocs/content-collections";




export const source = loader({
  baseUrl: "/",
  source: createMDXSource(allDocs, allMetas),
});

// export const getAncestorsFolder = (slug: string[]) => {
// //   get page, and
//   source.pageTree.children
//   const page = source.getNodeMeta
// }