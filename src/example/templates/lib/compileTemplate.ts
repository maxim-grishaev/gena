import _ from 'lodash'
import fsx from 'fs-extra'
import path from 'path'

export const compileTemplate = async (
  templatePath: string,
  options?: _.TemplateOptions,
) => {
  const templateSource = await fsx.readFile(templatePath)
  return _.template(String(templateSource), {
    sourceURL: path.relative(process.cwd(), templatePath),
    // (string): The data object variable name.
    variable: 'VARS',
    ...options,
  })
}
