import * as core from "@actions/core";
import * as fs from 'fs'
import { parse } from 'yaml'
import { Rule } from '../shared/watch-type.js'
import { handlePostRule } from './bili/new-post.js'

// rules
const watchFile = core.getInput("watch-file") || ".github/bili.rule.yml"
const ruleString = fs.readFileSync(watchFile, 'utf8')
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

const output = [] as Event[]


// 1. get the newest video
// 2. get filepath
// 3. check if file exist
// 4. if exist skip
// 5. if not exist, start a fetch stage
for (const rule of res.watch) {
  const {post: postRule, season, series, collection } = rule.platform.bilibili!
  if(postRule) {
    const res = await handlePostRule(postRule).catch(e => {
      console.error(`handle-rule-post-error`, e)
      return undefined
    })
    if(res) output.push(res)
  }
  if(season) {}
  if(series) {}
  if(collection) {}
}

core.setOutput("result", output)