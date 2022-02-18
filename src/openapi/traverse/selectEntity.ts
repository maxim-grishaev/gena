import type { openapi } from '../types/opanapi'
import type { nsGenEntity } from '../types/nsGenEntity'
import { EntityGuard } from './EntityGuard'
import { createSpecAndValidate } from './spec'
import { isDefined } from '../util'

export const pickEntity = (doc: openapi.Document, name: string) =>
  doc.components?.schemas?.[name]

export const getRefPath = (entity: openapi.Reference) =>
  entity.$ref.replace('#/components/schemas/', '')

export const selectEnums = (
  doc: openapi.Document,
): nsGenEntity.EntitySpec<'enum'>[] => {
  if (!doc.components || !doc.components.schemas) {
    return []
  }
  const enums = Object.entries(doc.components.schemas).reduce(
    (memo, [entityName, entity]) => {
      if (EntityGuard.isRef(entity)) {
        return memo
      }
      const spec = createSpecAndValidate(entity, [entityName])
      if (spec.kind === 'enum') {
        return memo.concat(spec)
      }

      if (EntityGuard.isStruct(entity)) {
        const enumsOfStruct: nsGenEntity.EntitySpec<'enum'>[] = []
        const entityProps = Object.entries(entity.properties || {})
        for (const [propName, propDefinition] of entityProps) {
          const spec = createSpecAndValidate(propDefinition, [
            entityName,
            propName,
          ])
          if (spec.kind === 'enum') {
            enumsOfStruct.push(spec)
          }
        }
        return memo.concat(enumsOfStruct)
      }
      return memo
    },
    [] as nsGenEntity.EntitySpec<'enum'>[],
  )
  return enums
}

export const selectStructs = (
  doc: openapi.Document,
): nsGenEntity.EntitySpec<'struct'>[] =>
  Object.entries(doc?.components?.schemas || {})
    .map(([entityName, struct]) => {
      const spec = createSpecAndValidate(struct, [entityName])
      return spec.kind === 'struct' ? spec : null
    })
    .filter(isDefined)
