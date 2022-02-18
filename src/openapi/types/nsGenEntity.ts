// @see https://swagger.io/specification/

import { OpenAPIV3 } from 'openapi-types'
import { openapi } from './opanapi'

export namespace nsGenEntity {
  export namespace EntityType {
    export type Array = 'array'
    export type Struct = 'object'
    export type Primitive = Exclude<OpenAPIV3.NonArraySchemaObjectType, Struct>
    export type Any = OpenAPIV3.NonArraySchemaObjectType | Array
  }

  export type EntityKind = keyof EntityMap
  export type ValidEntity = EntityMap[EntityKind]

  export interface EntitySpec<K extends EntityKind = EntityKind> {
    kind: K
    definition: EntityMap[K]
    entityName: string[]
  }
  export interface PrimitiveEntity extends openapi.Base {
    type: EntityType.Primitive
  }
  export interface StructEntity extends openapi.Base {
    type?: EntityType.Struct
  }

  export type EntityWith<
    K extends keyof openapi.Base,
    V extends EntityType.Any = EntityType.Any,
  > = Omit<openapi.Base, K> &
    Required<Pick<openapi.Base, K>> & {
      type?: V
    }
  export interface EntityMap {
    primitive: PrimitiveEntity
    struct: StructEntity
    array: openapi.Array
    enum: EntityWith<'enum'>
    unknown: openapi.NonArray | null
    reference: openapi.Reference
  }
  export type AnySpec =
    | EntitySpec<'array'>
    | EntitySpec<'enum'>
    | EntitySpec<'struct'>
    | EntitySpec<'primitive'>
    | EntitySpec<'reference'>
    | EntitySpec<'unknown'>

  type AllKeys =
    | keyof openapi.Reference
    | keyof OpenAPIV3.ArraySchemaObject
    | keyof OpenAPIV3.NonArraySchemaObject
  export type EntityLike = { [key in AllKeys]?: unknown }

  // https://json-schema.org/understanding-json-schema/reference/combining.html
  export type ConjType = 'allOf' | 'oneOf' | 'anyOf'
}
