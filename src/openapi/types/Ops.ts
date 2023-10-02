// @see https://swagger.io/specification/

import { OpenAPIV3 } from 'openapi-types'
import { openapi } from './opanapi'

export interface SpecOfOperation {
  type: 'operation'
  method: openapi.OperationType
  pathTemplate: string
  pathItem: openapi.PathItem
  operation: openapi.Operation
  // document: openapi.Document
}
export interface SpecOfPath {
  type: 'path'
  pathTemplate: string
  pathItem: openapi.PathItem
  // document: openapi.Document
}
export interface SpecOfResponse {
  type: 'response'
  name: string
  response: OpenAPIV3.ResponseObject | OpenAPIV3.ReferenceObject
  // document: OpenAPIV3.Document
}
