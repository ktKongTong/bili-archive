import { render } from 'micromustache'

export const format = (tempalte: string, data: any) => {
  return render(tempalte, data)
}