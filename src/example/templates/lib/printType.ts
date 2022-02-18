import type { openapi } from '@cgi/openapi/types/opanapi'
import type { nsGenEntity } from '@cgi/openapi/types/nsGenEntity'
import { isDefined } from '@cgi/openapi/util'
import { createEntityWalker } from '@cgi/openapi/traverse/createEntityWalker'
import { EntityGuard } from '@cgi/openapi/traverse/EntityGuard'
import { toPascalCase } from './strings'
import { ObjectPropSpec, printObject, printComment } from './printTS'

export const printJSDOC = (entity: openapi.AnyEntity) => {
  if (EntityGuard.isRef(entity)) {
    return ''
  }
  const { title, description, example, format } = entity
  if (![title, description, example, format].some(isDefined)) {
    return ''
  }
  return printComment(
    [
      title,
      description,
      format ? `Format: ${format}` : null,
      example ? `@example ${JSON.stringify(example)}` : null,
    ].filter(isDefined),
  )
}

const withComment = (text: string, val: string) => `/* ${text} */ ${val}`

const isNullable = (def: openapi.AnyEntity) =>
  EntityGuard.isRef(def) || def.nullable

const PRIMITIVE_MAP: Record<nsGenEntity.EntityType.Primitive, string> = {
  string: 'string',
  boolean: 'boolean',
  integer: 'number',
  number: 'number',
}

export const printType = createEntityWalker<string>({
  unknown: (def) => withComment(`unknown.type: ${def?.type}`, 'unknown'),
  primitive: (type) => PRIMITIVE_MAP[type],
  ref: (name) => toPascalCase(name),
  enum: (enumDef) =>
    withComment('enum', enumDef.enum.map((v) => JSON.stringify(v)).join('|')),
  struct: (about, entity) => {
    const objLines: ObjectPropSpec[] = Object.entries(
      entity.properties || {},
    ).map(([propName, propDefinition]) => {
      const nullable = isNullable(propDefinition)
      return {
        key: `${JSON.stringify(propName)}${nullable ? '?' : ''}`,
        value:
          Object.keys(about.props).length === 0
            ? withComment('Struct with no props', 'unknown')
            : about.props[propName],
        comment: printJSDOC(propDefinition),
      }
    })

    const printStruct = (lines: ObjectPropSpec[]) =>
      lines.length ? printObject(lines) : 'Record<string, unknown>'

    if (!about.isExtendable) {
      return printStruct(objLines)
    }

    return withComment(
      'extensible struct',
      printObject([
        {
          key: '[key: string]',
          value: about.subType,
          comment: printComment(['Index type']),
        },
        ...objLines,
      ]),
    )
  },
  array: (subType) => `Array<${subType ?? withComment('!subType', 'unknown')}>`,
  // conjunctive
  allOf: (subTypes) => withComment('allOf', subTypes.join(' & ')),
  oneOf: (subTypes) => withComment('oneOf', subTypes.join(' | ')),
  anyOf: (subTypes) => withComment('anyOf', subTypes.join(' | ')),
})
