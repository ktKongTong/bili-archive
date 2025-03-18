import * as core from "@actions/core";
import { render } from 'micromustache'

const input = core.getInput("variable");

const aiInput = core.getInput("ai")

const template = core.getInput("template")

const data = JSON.parse(input)

let ai = {}
if(aiInput) {
  ai = JSON.parse(aiInput)
}

const dataToInject = {
  ai,
  video: data
}

core.setOutput('result', render(template, dataToInject))
