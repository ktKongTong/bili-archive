import {Folder, FolderTransformer, Root, RootTransformer} from "@/lib/source/shared";

export const indexFolderTransformer: FolderTransformer = {
  beforeBuildTree: (folder) => {
    const regex = /\d{4}_\d{4}/
    if(regex.test(folder.name)) {
      const [start, end] = folder.name.split('_')
      folder.name = `第 ${parseInt(start)} 期 ～ 第 ${parseInt(end)} 期`
    }
  },
  afterBuildTree: (folder) => {
    folder.children = folder.children.toReversed()
  }
}


export const dateFolderTransformer: FolderTransformer = {
  beforeBuildTree: (folder) => {
    const regex = /20\d{2}/
    if(regex.test(folder.name)) {
      folder.name = `${folder.name} 年`
      return
    }
    const seasonRegex = /\d{2}-\d{2}/
    if(seasonRegex.test(folder.name)) {
      const [start, end] = folder.name.split('-')
      folder.name = ` ${parseInt(start)} 月 ～ ${parseInt(end)} 月`
      return
    }
  },
  afterBuildTree: (folder) => {
    folder.children = folder.children.toSorted((a, b) => {
      if(a.type ==='folder' || b.type === 'folder') {
        return -1
      }
      if(a.type === 'page' && b.type == "page") {
        return (b.data?.date?.getTime() ?? 0) - (a.data?.date?.getTime() ?? 0)
      }
      return 0
    })
    console.log("sorted", JSON.stringify(folder.children.map(it => it.url)))
  }
}


export const addRSSPage = (url: string) => ({
  beforeBuildTree: (root) => {
    if(root.root) {
      root.children.push({
        type: 'page',
        title: 'RSS',
        name: 'RSS',
        external: true,
        url: url,
        children: []
      })
    }
  }
}) as RootTransformer