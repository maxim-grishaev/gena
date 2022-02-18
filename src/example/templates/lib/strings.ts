import _ from 'lodash'

type NameParts = string | (string | undefined | null)[]

export const toConstName = (str: NameParts) =>
  _.snakeCase(fromParts(str)).toUpperCase()
export const toPascalCase = (str: NameParts) =>
  _.upperFirst(_.camelCase(fromParts(str)))
export const toCamelCase = (str: NameParts) =>
  _.lowerFirst(_.camelCase(fromParts(str)))
export const toKebabName = (str: NameParts) =>
  _.kebabCase(fromParts(str)).toLowerCase()

const fromParts = (parts: NameParts) =>
  typeof parts === 'string' ? parts : parts.filter(Boolean).join('-')
