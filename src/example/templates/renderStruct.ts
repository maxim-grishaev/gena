import type { nsGenEntity } from '@cgi/openapi/types/nsGenEntity'
import type { openapi } from '@cgi/openapi/types/opanapi'
import { getRefPath } from '@cgi/openapi/traverse/selectEntity'
import { toPascalCase } from './lib/strings'
import { printType, printJSDOC } from './lib/printType'

export const getStructName = (struct: nsGenEntity.EntitySpec<'struct'>) =>
  toPascalCase(struct.entityName)

export const renderOneStruct = (
  spec: nsGenEntity.EntitySpec<'struct'>,
  document: openapi.Document,
) => {
  const depNames: Record<string, string[]> = {}
  const structType = printType(document, spec.definition, {
    ref: (refName, def) => {
      depNames[refName] = getRefPath(def).split('/')
    },
  })
  return [
    ...Object.keys(depNames).map(
      (depName) =>
        `import { ${depName} } from './${depNames[depName].join('/')}';`,
    ),
    printJSDOC(spec.definition),
    `export type ${getStructName(spec)} = ${structType}`,
  ].join('\n')
}

export const renderManyStructs = (
  structs: nsGenEntity.EntitySpec<'struct'>[],
  document: openapi.Document,
) => structs.map((struct) => renderOneStruct(struct, document)).join('\n\n')
