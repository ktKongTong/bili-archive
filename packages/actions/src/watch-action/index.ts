import * as core from "@actions/core";
import { handlePostRule } from './bili/new-post.js'
import { ruleLoader } from '../shared/rule-loader.js'
import type {Event} from '../shared/type.js'

const watchPath = core.getInput("rule-path") || ".bili-archive/rules"
const rules = await ruleLoader(watchPath)
const output = [] as Event[]

// 1. get the newest video
// 2. get filepath
// 3. check if file exist
// 4. if exist skip
// 5. if not exist, start a fetch stage
for (const rule of rules.listen) {
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