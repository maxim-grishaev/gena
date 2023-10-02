import type { openapi } from '../types/opanapi'
import type * as nsGenEntity from '../types/Entity'
import { EntityGuard } from './EntityGuard'
import { createSpecAndValidate } from './spec'
import { pickEntity } from './selectEntity'

export const resolveRef = (doc: openapi.Document, ref: string) => {
  const die = (msg: string) => new Error(`[resolveRef] ${ref} => ${msg}`)

  const refEntity = pickEntity(doc, ref)
  if (!refEntity) {
    throw die(`Entity not found ${ref}`)
  }
  if (EntityGuard.isRef(refEntity)) {
    throw die(`${refEntity.$ref}. Indirect reference.`)
  }
  return refEntity
}

const resolveExtraEntity = (
  doc: openapi.Document,
  extraEntity: true | openapi.AnyEntity,
) => {
  if (extraEntity === true) {
    return null
  }
  if (EntityGuard.isRef(extraEntity)) {
    return resolveRef(doc, extraEntity.$ref)
  }
  return extraEntity
}

export const resolveEntityByPath = (
  doc: openapi.Document,
  entityName: string[],
): nsGenEntity.AnySpec => {
  const die = (msg: string) =>
    new Error(`[resolvePath] [${entityName.join('.')}] ${msg}`)

  const entity = pickEntity(doc, entityName[0])

  if (!entity) {
    throw die('Entity was not found')
  }

  if (EntityGuard.isRef(entity)) {
    const refEntity = resolveRef(doc, entity.$ref)
    return createSpecAndValidate(refEntity, entityName)
  }

  if (!entityName[1]) {
    return createSpecAndValidate(entity, entityName)
  }
  // TODO: implement
  if (entityName.length > 2) {
    throw die('Prop path walk > 1 is not implemented')
  }
  const propName = entityName[1]
  if (!EntityGuard.isStruct(entity)) {
    throw die('Entity is not a struct')
  }
  const propEntity = entity.properties?.[propName]
  if (!propEntity) {
    // TODO:
    if (
      EntityGuard.isExtensible(entity) &&
      entity.additionalProperties !== false
    ) {
      const extraEntity = resolveExtraEntity(doc, entity.additionalProperties)
      return createSpecAndValidate(extraEntity, entityName)
    }
    throw die('Prop was not found')
  }
  if (EntityGuard.isRef(propEntity)) {
    const refEntity = resolveRef(doc, propEntity.$ref)
    return createSpecAndValidate(refEntity, entityName)
  }
  return createSpecAndValidate(propEntity, entityName)
}
