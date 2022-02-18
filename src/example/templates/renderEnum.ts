import type { nsGenEntity } from '@cgi/openapi/types/nsGenEntity'
import { toConstName, toPascalCase } from './lib/strings'
import { ObjectPropSpec, printComment, printObject } from './lib/printTS'

type EnumSpec = nsGenEntity.EntitySpec<'enum'>

export const getEnumName = (enumSpec: EnumSpec, delim = '') =>
  enumSpec.entityName.map(toPascalCase).join(delim)

export const renderOneEnum = (enumName: string, enumItem: EnumSpec) => {
  const entities: ObjectPropSpec[] = enumItem.definition.enum.map(
    (enumVal) => ({
      key: toConstName(enumVal),
      value: JSON.stringify(enumVal),
    }),
  )
  return [
    printComment([
      enumName,
      enumItem.entityName.join('.'),
      enumItem.definition.description,
    ]),
    `export const ${enumName} = ${printObject(entities)} as const;`,
    `${getEnumName(enumItem, '.')} = ${enumName};`,
  ].join('\n')
}

export const renderManyEnums = (enums: EnumSpec[]) =>
  enums
    .map((enumItem) => renderOneEnum(getEnumName(enumItem), enumItem))
    .join('\n\n')
