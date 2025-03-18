export type Template = {
  filepath?: string
  prompt?: {
    system?: string,
    user?: string
    jsonschema?: any
  }
  markdown?: string
  "commit-message"?: string
}

export type ResultTemplate = {
  filepath: string | undefined
  prompt: {
    system?: string,
    user?: string
    jsonschema?: any
  }
  markdown: string | undefined
  "commit-message": string | undefined
}

export type AvailablePlatform = 'bilibili' | 'youtube' | 'wechat-official-account'

export type BiliCondition = {
  // mid?: number | string,
  // 'channel-id'?: number | string,
  // title?: string,
}

export type Condition<T extends Record<string, any> = Record<string, any>> = {
  and?: Condition<T>
  or?: Condition<T>
} & T

export type PlatformCondition = {
  'bilibili': BiliCondition
}

export type ConditionalRule = {
  id: string
  description: string
  platform: Record<AvailablePlatform, { condition: Condition<PlatformCondition[keyof PlatformCondition]>, template?: Template, script?: string}>
  fallback?: { template?: Template, script?: string }
}

export type Rule = {
  script?: string,
  match: ConditionalRule[]
  fallback?: Template
}