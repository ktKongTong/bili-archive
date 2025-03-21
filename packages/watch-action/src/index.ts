import * as core from "@actions/core";

import { render } from "micromustache";
import * as fs from 'fs'
import { parse } from 'yaml'

const watchFile = core.getInput("watch-file") || ".github/bili.rule.yml"

const ruleString = fs.readFileSync(watchFile, 'utf8')

type PostWatchRule = {
  filepath: string,
  mid: string,
  script?: string,
  title?: string,
}

type WatchRule = {
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

type Rule = {
  watch: WatchRule[]
}
const res = parse(ruleString) as Rule

type Event = {
  type: 'bilibili',
  payload: {
    bvid: string
    presetFilepathTemplate?: string | undefined
    presetSystemPromptTemplate?: string | undefined
    presetPromptTemplate?: string | undefined
    presetMarkdownTemplate?: string | undefined
    presetCommitMessageTemplate?: string | undefined
  }
}
// every 20 min
const output = [] as Event[]

const createPreset = () => ({
  filepath: undefined,
  prompt: {
    user: undefined,
    system: undefined,
  },
  markdown: undefined,
  'commit-message': undefined
})

const applyTemplate = (preset: any, data: any) => {
  if (!preset.filepath) {
    preset.filepath = data.presetFilepathTemplate
  }
  if (!preset.prompt?.user) {
    preset.prompt.user = data.prompt?.user
  }
  if (!preset.prompt?.system) {
    preset.prompt.system = data.prompt?.system
  }
  if (!preset.markdown) {
    preset.markdown = data.markdown
  }
  if (!preset['commit-message']) {
    preset['commit-message'] = data['commit-message']
  }
}


const fetchNewPost = async (param: {
  mid: string
  title?: string,
}) => {
  if (param.mid) {
    const res = await fetch(`https://api.bilibili.com/x/series/recArchivesByKeywords?mid=${param.mid}&keywords=${param.title ?? ''}&ps=100`)
      .then(res => res.json())
    core.debug(`result-res, ${JSON.stringify(res)}`)
    return res as any
  }
  return
}

// # 1. get the newest video
// # 2. calculate filepath
// # 3. check if file exist
// # 4. if exist skip
// # 5. if not exist, start a fetch stage
const handlePostRule = async (postRule: PostWatchRule) => {
  let preset = createPreset()
  const v = await fetchNewPost(postRule)
  let filepath = undefined
  if(v && v.data) {
    const video = v.data.archives[0]
    console.log(`load-watch-script: ${postRule.script}`)
      if(postRule.script) {
        const script = render(postRule.script, v.data)
        console.log("loading-watch-script", script)
        const {watch} = await import(script)
        console.log("loaded-watch-script", script)
        if(watch && typeof watch === 'function') {
          console.log("executing-script", script)
          const { filepath: fp, template } = watch(v.data)
          if (fp && typeof fp === 'string') {
            filepath = fp
            if(template) applyTemplate(preset, template)
          }
          console.log("executing-result", fp, template)
        }
      }
      if(!filepath) {
        filepath = render(postRule.filepath, video)
      }
      if(filepath && !fs.existsSync(filepath)) {
        output.push({type: 'bilibili', payload: {
            bvid: video.bvid,
            presetFilepathTemplate: filepath,
            presetSystemPromptTemplate: preset.prompt.system,
            presetPromptTemplate: preset.prompt.user,
            presetMarkdownTemplate: preset.markdown,
            presetCommitMessageTemplate: preset['commit-message'],
          }})
      }
  }
}


for (const rule of res.watch) {

  const {post: postRule, season, series, collection } = rule.platform.bilibili!
  if(postRule) {
    await handlePostRule(postRule).catch(e => {
      console.error(`handle-rule`, e)
    })
  }
  // not implemented
  if(season) {}
  if(series) {}
  if(collection) {}
}

// an error
core.setOutput("result", output)