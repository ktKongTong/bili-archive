
export type PostWatchRule = {
  filepath: string,
  mid: string,
  script?: string,
  title?: string,
}

export type WatchRule = {
  id: string
  platform: {
    // if match trigger event
    bilibili?: {
      // check file if exist
      post?: PostWatchRule,
      series?: {
        mid: string,
        seriesId: string
      },
      season?: {
        mid: string,
        seasonId: string
      },
      collection?: {
        mid: string,
        collectionId: string
      }
    },
  }
}



export type Rule = {
  watch: WatchRule[]
}