import type { nsGenEntity } from '../types/nsGenEntity'
import type { nsGenImpl } from '../types/nsGenImpl'
import type { openapi } from '../types/opanapi'
import { OpenAPIV3 } from 'openapi-types'
import { getRefPath } from './selectEntity'
import { EntityGuard } from './EntityGuard'

const CONJ_TYPE_MAP: Record<nsGenEntity.ConjType, nsGenEntity.ConjType> = {
  allOf: 'allOf',
  anyOf: 'anyOf',
  oneOf: 'oneOf',
}
const CONJ_TYPES = Object.keys(CONJ_TYPE_MAP) as nsGenEntity.ConjType[]

export const createEntityWalker = <T>(api2lang: nsGenImpl.EntityVisitor<T>) => {
  const getTypeSpec = (
    doc: openapi.Document,
    entity?: openapi.AnyEntity,
    callbacks?: {
      ref?: (
        refType: T,
        entity: openapi.Reference,
        doc: openapi.Document,
      ) => void
      unknown?: (
        entity: OpenAPIV3.NonArraySchemaObject | null,
        doc: openapi.Document,
      ) => void
    },
  ): T => {
    if (!entity) {
      callbacks?.unknown?.(null, doc)
      return api2lang.unknown(null, doc)
    }
    if (EntityGuard.isRef(entity)) {
      const compName = getRefPath(entity).split('/')
      const refOut = api2lang.ref(compName, entity, doc)
      callbacks?.ref?.(refOut, entity, doc)
      return refOut
    }

    const conjType = CONJ_TYPES.find((k) => Array.isArray(entity[k]))
    if (conjType && EntityGuard.isPropDefined(conjType, entity)) {
      const subTypes = entity[conjType].map((item) =>
        getTypeSpec(doc, item, callbacks),
      )
      const visitConjFn = api2lang[conjType]
      return visitConjFn(subTypes, entity, doc)
    }

    if (EntityGuard.isEnum(entity)) {
      return api2lang.enum(entity, doc)
    }

    if (EntityGuard.isArray(entity)) {
      const subType = entity.items
        ? getTypeSpec(doc, entity.items, callbacks)
        : null
      return api2lang.array(subType, entity, doc)
    }

    if (EntityGuard.isStruct(entity)) {
      const { additionalProperties } = entity
      const entityProps = entity.properties || {}
      const props = {} as Record<string, T>
      Object.keys(entityProps).forEach((k) => {
        props[k] = getTypeSpec(doc, entityProps[k], callbacks)
      })
      let param: nsGenImpl.StructWalkerParams<T> = {
        props,
        isExtendable: false,
        indexEntity: null,
        subType: null,
      }
      if (EntityGuard.isExtensible(entity)) {
        const indexEntity =
          !additionalProperties || typeof additionalProperties === 'boolean'
            ? null
            : additionalProperties
        param = {
          props,
          isExtendable: true,
          indexEntity,
          subType: indexEntity
            ? getTypeSpec(doc, indexEntity, callbacks)
            : api2lang.unknown(null, doc),
        }
      }
      return api2lang.struct(param, entity, doc)
    }

    if (EntityGuard.isPrimitive(entity)) {
      return api2lang.primitive(entity.type, entity, doc)
    }

    callbacks?.unknown?.(entity, doc)
    return api2lang.unknown(entity, doc)
  }
  getTypeSpec.TYPES = api2lang
  return getTypeSpec
}
