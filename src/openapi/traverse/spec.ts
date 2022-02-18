import type { nsGenEntity } from '../types/nsGenEntity'
import type { openapi } from '../types/opanapi'
import { EntityGuard } from './EntityGuard'

const createSpec = <EK extends nsGenEntity.EntityKind>(
  kind: EK,
  entity: nsGenEntity.EntityMap[EK],
  entityName: string[],
) => ({
  kind: kind as EK,
  definition: entity,
  entityName,
})

export const createSpecAndValidate = (
  entity: openapi.AnyEntity | null,
  entityName: string[],
): nsGenEntity.AnySpec => {
  if (!entity) {
    return createSpec('unknown', {}, entityName)
  }
  if (EntityGuard.isPrimitive(entity)) {
    return createSpec('primitive', entity, entityName)
  }
  if (EntityGuard.isStruct(entity)) {
    return createSpec('struct', entity, entityName)
  }
  if (EntityGuard.isArray(entity)) {
    return createSpec('array', entity, entityName)
  }
  if (EntityGuard.isEnum(entity)) {
    return createSpec('enum', entity, entityName)
  }
  if (EntityGuard.isRef(entity)) {
    return createSpec('reference', entity, entityName)
  }
  return createSpec('unknown', entity, entityName)
}
