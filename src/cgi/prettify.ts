import path from 'path'
import { ESLint } from 'eslint'
import Vinyl from 'vinyl'

export const prettifyJSON = (file: Vinyl) =>
  JSON.stringify(JSON.parse(String(file.contents)), null, 2)

const SEVERITY = ['off', 'warning', 'error']

export const prettifyWithEslint = async (
  file: Vinyl,
  { cwd = undefined }: { cwd?: string } = {},
) => {
  const eslint = new ESLint({
    cwd,
    useEslintrc: true,
    fix: true,
  })

  const src = String(file.contents)
  const [res] = await eslint.lintText(src, {
    filePath: file.path,
  })
  if (res.errorCount > 0) {
    console.error('\n', path.relative(cwd ?? file.cwd, file.path))
    res.messages.forEach((msg) => {
      console.log(
        SEVERITY[msg.severity],
        msg.ruleId,
        msg.message,
        msg.suggestions ?? '',
      )
    })
  }
  return res.output ?? src
}
