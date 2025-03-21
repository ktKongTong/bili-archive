import * as core from "@actions/core";
import * as fs from 'node:fs'
import {parse} from 'yaml'
import {  Rule, Template } from './type.js'
import { testRule } from './test-rule.js'
import { render } from "micromustache";
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

const applyRule = (cur?: Template) => {
  if(!template.prompt.system) {
    template.prompt.system = cur?.prompt?.system
  }
  if(!template.prompt.user) {
    template.prompt.user = cur?.prompt?.user
  }
  if(!template.filepath) {
    template.filepath = cur?.filepath
  }
  if(!template.markdown) {
    template.markdown = cur?.markdown
  }
  if(!template['commit-message']) {
    template['commit-message'] = cur?.['commit-message']
  }
}

outer: for(const rule of res.match) {
  if(rule.platform) {
    const platformRuleKey = Object.keys(rule.platform)
    for(const key of platformRuleKey) {
      const platform = rule.platform[key as keyof typeof rule.platform]
      const condition = platform.condition
      let scriptApplied = false
      if(platform.script) {
        try {
          const res = render(platform.script, {video: data, platform: platform})
          console.log("load-script", platform.script, res)
          const { template: fn } = await import(res)
          if(fn && typeof fn == 'function') {
            let result = fn(data)
            if(result) {
              if(typeof result === 'object') {
                applyRule(result)
              }
              // one field is set and result is not undefined or
              if(
                template.markdown || template.filepath ||
                template.prompt.system || template.prompt.user ||
                template['commit-message']
              ) {
                scriptApplied = true
              }
            }
          }
        }catch (e) {
          console.error(e)
        }
      }
      if(scriptApplied || testRule(condition, data)) {
        applyRule(platform.template)
        // apply fallback template
        applyRule(rule.fallback?.template)
        break outer
      }
    }
  }
}

applyRule(res.fallback)

core.setOutput('filepath-template', template.filepath)
core.setOutput('system-prompt-template', template.prompt?.system)
core.setOutput('prompt-template',  template.prompt?.user)
core.setOutput('markdown-template',  template.markdown)
core.setOutput('commit-message-template', template['commit-message'])
