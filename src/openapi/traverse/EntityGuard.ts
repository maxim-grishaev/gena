import type { nsGenEntity } from '../types/nsGenEntity'
import type { openapi } from '../types/opanapi'

export type PropDefined<Obj, K extends keyof Obj> = Omit<Obj, K> &
  Required<Pick<Obj, K>>

export const getAPIComponentName = (component: openapi.Reference) =>
  component && component.$ref ? component.$ref.split('/').pop() : null

const isPropDefined = <T, K extends keyof T>(
  key: string,
  entity: T | PropDefined<T, K>,
): entity is PropDefined<T, K> => Boolean(entity) && entity[key as K] != null

const isRef = (entity: nsGenEntity.EntityLike): entity is openapi.Reference =>
  isPropDefined('$ref', entity)

const isEntity = (
  entity: nsGenEntity.EntityLike,
): entity is openapi.NonArray | openapi.Array =>
  Boolean(entity) && !isRef(entity)

const isExtensible = <E extends nsGenEntity.EntityLike>(
  entity: E | PropDefined<E, 'additionalProperties'>,
): entity is PropDefined<E, 'additionalProperties'> =>
  isPropDefined('additionalProperties', entity) &&
  entity.additionalProperties !== false

const isArray = (
  entity: nsGenEntity.EntityLike,
): entity is nsGenEntity.EntityMap['array'] =>
  isEntity(entity) && entity.type === 'array' // && isPropDefined('items', entity)

// Define entity type
const isStruct = (
  entity: nsGenEntity.EntityLike,
): entity is nsGenEntity.EntityMap['struct'] =>
  isEntity(entity) && (entity.type === 'object' || !entity.type)

const isEnum = (
  entity: nsGenEntity.EntityLike,
): entity is nsGenEntity.EntityMap['enum'] =>
  isEntity(entity) && isPropDefined('enum', entity)

const isPrimitiveType = (
  type: nsGenEntity.EntityType.Primitive | (string & { _?: never }) | undefined,
): type is nsGenEntity.EntityType.Primitive =>
  type === 'string' ||
  type === 'boolean' ||
  type === 'integer' ||
  type === 'number'

const isPrimitive = (
  entity: nsGenEntity.EntityLike,
): entity is nsGenEntity.EntityMap['primitive'] =>
  isEntity(entity) && isPrimitiveType(entity.type)

const isValid = (
  entity: nsGenEntity.EntityLike | null,
): entity is nsGenEntity.ValidEntity =>
  entity != null &&
  (isStruct(entity) || isArray(entity) || isEnum(entity) || isPrimitive(entity))

const isEntityLike = (
  entity: nsGenEntity.EntityLike | unknown,
): entity is nsGenEntity.EntityLike =>
  entity != null && typeof entity === 'object'

export const EntityGuard = {
  isEntityLike,
  isRef,
  isPropDefined,
  isStruct,
  isExtensible,
  isEnum,
  isArray,
  isPrimitive,
  isValid,
}
