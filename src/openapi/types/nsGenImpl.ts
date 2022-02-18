// @see https://swagger.io/specification/
import type { nsGenEntity } from '@cgi/openapi/types/nsGenEntity'
import SwaggerParser from '@apidevtools/swagger-parser'
import { openapi } from './opanapi'

export namespace nsGenImpl {
  export type StructWalkerParams<T> =
    | {
        isExtendable: true
        props: Record<string, T>
        indexEntity: openapi.AnyEntity | null
        subType: T
      }
    | {
        isExtendable: false
        props: Record<string, T>
        indexEntity: null
        subType: null
      }
  export interface EntityVisitor<T> {
    unknown: (def: nsGenEntity.EntityMap['unknown'], doc: openapi.Document) => T
    ref: (
      name: string[],
      def: nsGenEntity.EntityMap['reference'],
      doc: openapi.Document,
    ) => T
    primitive: (
      type: nsGenEntity.EntityType.Primitive,
      def: nsGenEntity.EntityMap['primitive'],
      doc: openapi.Document,
    ) => T
    enum: (def: nsGenEntity.EntityMap['enum'], doc: openapi.Document) => T
    struct: (
      params: StructWalkerParams<T>,
      def: nsGenEntity.EntityMap['struct'],
      doc: openapi.Document,
    ) => T
    array: (
      subType: T | null,
      def: nsGenEntity.EntityMap['array'],
      doc: openapi.Document,
    ) => T
    allOf: (
      subTypes: T[],
      def: nsGenEntity.EntityWith<'allOf'>,
      doc: openapi.Document,
    ) => T
    oneOf: (
      subTypes: T[],
      def: nsGenEntity.EntityWith<'oneOf'>,
      doc: openapi.Document,
    ) => T
    anyOf: (
      subTypes: T[],
      def: nsGenEntity.EntityWith<'anyOf'>,
      doc: openapi.Document,
    ) => T
  }

  interface BaseGeneratorInput {
    title: string
    outDir: string
    aliases?: Record<string, string>
    templateVars?: Record<string, string>
    cwd?: string
    schemaOptions?: SwaggerParser.Options['resolve']
    pathPrefixes?: string[]
  }
  export type GeneratorInput = BaseGeneratorInput &
    (
      | {
          url: string
        }
      | {
          filePath: string
        }
    )
}
