import * as core from "@actions/core";
import { render } from 'micromustache'

const input = core.getInput("variable");

const aiInput = core.getInput("ai")

const template = core.getInput("template")
const needEscapeChars = core.getInput("need-escape-chars")
const escapeChar = core.getInput("escape-char")
const data = JSON.parse(input)


let ai = {}
if(aiInput) {
  ai = JSON.parse(aiInput)
}

const dataToInject = {
  ai,
  video: data
}
function escapeAndReplaceLeafValues(
  obj: any,
  specialChars: string[],
  replacementValue: string = "_"
): any {


  function escapeString(s: any): any {
    if (typeof s !== "string") {
      return s;
    }
    let escapedString = "";
    for (const char of s) {
      if (specialChars.includes(char)) {
        escapedString += replacementValue;
      } else {
        escapedString += char;
      }
    }
    return escapedString;
  }

  function processNode(node: any): any {
    if (typeof node === "object" && node !== null) {
      if (Array.isArray(node)) {
        return node.map(processNode);
      } else {
        const newNode: { [key: string]: any } = {};
        for (const key in node) {
          if (node.hasOwnProperty(key)) {
            newNode[key] = processNode(node[key]);
          }
        }
        return newNode;
      }
    } else {
      if (typeof node === "string") {
        return escapeString(node);
      } else {
        return node;
      }
    }
  }

  return processNode(obj);
}


const specialChars = needEscapeChars.split('')
// replace special char before render
let escapedData = dataToInject
try {
  escapedData = escapeAndReplaceLeafValues(dataToInject, specialChars, escapeChar)
}catch (e) {
  core.warning(`escape error, ignore it, ${e?.toString()}`)
}

core.setOutput('result', render(template, escapedData))
