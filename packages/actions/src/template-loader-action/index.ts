import * as core from "@actions/core";
import * as fs from 'node:fs'
import {parse} from 'yaml'
import { ResultTemplate, Rule } from '../shared/type.js'
import { testRule } from '../shared/test-rule.js'
import { modifyTemplate } from '../shared/template.js'
import { format } from '../shared/format.js'

const input = core.getInput("variable");
const matchFile = core.getInput("match-file") || ".github/bili.rule.yml"
const presetFilepathTemplate = core.getInput("preset-filepath-template") || undefined
const presetSystemPromptTemplate = core.getInput("preset-system-prompt-template") || undefined
const presetPromptTemplate = core.getInput("preset-prompt-template") || undefined
const presetMarkdownTemplate = core.getInput("preset-markdown-template") || undefined
const presetCommitMessageTemplate = core.getInput("preset-commit-message-template") || undefined

const data = JSON.parse(input)
const ruleString = fs.readFileSync(matchFile, 'utf8')
const res = parse(ruleString) as Rule

let template = {
  filepath: presetFilepathTemplate,
  prompt: {
    user: presetPromptTemplate,
    system: presetSystemPromptTemplate,
  },
  markdown: presetMarkdownTemplate,
  'commit-message': presetCommitMessageTemplate
}



// watch, match, calculate template script
const applyScript = async (template: ResultTemplate,script?: string) => {
  let applied = false
  if(script) {
    try {
      const res = format(script, {video: data, platform: 'bilibili'})
      console.log("load-script", script, res)
      const { template: fn } = await import(res)
      if(fn && typeof fn == 'function') {
        let result = fn(data)
        if(result && typeof result === 'object') {
          applied = modifyTemplate(template,result)
        }
      }
    }catch (e) {
      applied = false
      console.error(e)
    }
  }
  return applied
}





outer: for(const rule of res.match) {
  if(rule.platform) {
    const platformRuleKey = Object.keys(rule.platform)
    for(const key of platformRuleKey) {
      const platform = rule.platform[key as keyof typeof rule.platform]
      const condition = platform.condition
      const scriptApplied = await applyScript(template, platform.script)
      if(scriptApplied || testRule(condition, data)) {
        // apply platform-specific(like bilibili output audio) template
        modifyTemplate(template, platform.template)
        modifyTemplate(template, rule.fallback?.template)
        break outer
      }
    }
  }
}
modifyTemplate(template, res.fallback)




core.setOutput('filepath-template', template.filepath)
core.setOutput('system-prompt-template', template.prompt?.system)
core.setOutput('prompt-template',  template.prompt?.user)
core.setOutput('markdown-template',  template.markdown)
core.setOutput('commit-message-template', template['commit-message'])
