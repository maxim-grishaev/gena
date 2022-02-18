import { OpenAPIV3, OpenAPIV2 } from 'openapi-types'

export namespace openapi {
  // schema-object
  export type Document = OpenAPIV3.Document
  export type V2Document = OpenAPIV2.Document

  export type Base = OpenAPIV3.BaseSchemaObject
  export type Reference = OpenAPIV3.ReferenceObject
  export type Array = Omit<OpenAPIV3.ArraySchemaObject, 'items'> & {
    items?: OpenAPIV3.ArraySchemaObject['items']
  }
  export type NonArray = OpenAPIV3.NonArraySchemaObject
  export type AnyEntity = Array | NonArray | Reference

  export type PathItem = OpenAPIV3.PathItemObject
  export type Operation = OpenAPIV3.OperationObject
  export type Response = OpenAPIV3.ResponseObject

  export type OperationType =
    | 'get'
    | 'put'
    | 'post'
    | 'delete'
    | 'options'
    | 'head'
    | 'patch'
    | 'trace'
}
