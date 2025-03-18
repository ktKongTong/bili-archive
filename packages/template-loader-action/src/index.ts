import * as core from "@actions/core";
import * as fs from 'node:fs'
import {parse} from 'yaml'
import { ResultTemplate, Rule, Template } from './type.js'
import { testRule } from './test-rule.js'
const input = core.getInput("variable");
const matchFile = core.getInput("match-file") || ".github/bili.rule.yml"

const data = JSON.parse(input)
const ruleString = fs.readFileSync(matchFile, 'utf8')

const res = parse(ruleString) as Rule

let template: ResultTemplate = {
  filepath: undefined,
  prompt: {
    user: undefined,
    system: undefined,
  },
  markdown: undefined,
  'commit-message': undefined
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
      if(testRule(condition, data)) {
        // apply conditional template
        applyRule(platform.template)
        // apply fallback template
        applyRule(rule.fallback?.template)
        break outer
      }
    }
  }
}

applyRule(res.fallback)

// apply match



// const conditions = res.matchRules


// conditions

// const Rules = []

// 1. match script
//   direct use

// 2. match condition

// 3.

// template-script

// console.log(template)
core.setOutput('filepath-template', template.filepath)
core.setOutput('system-prompt-template', template.prompt?.system)
core.setOutput('prompt-template',  template.prompt?.user)
core.setOutput('markdown-template',  template.markdown)
core.setOutput('commit-message-template', template['commit-message'])
