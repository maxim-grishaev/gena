import type { nsGenOps } from '../types/nsGenOps'
import type { openapi } from '../types/opanapi'
import { isDefined } from '../util'

//
// Response
//
export const selectResponses = (doc: openapi.Document) =>
  Object.entries(doc.components?.responses || {}).reduce(
    (arr, [respName, resp]) => arr.concat(createRespSpec(respName, resp)),
    [] as nsGenOps.SpecOfResponse[],
  )

const createRespSpec = (
  name: string,
  response: openapi.Response | openapi.Reference,
  // document: openapi.Document,
): nsGenOps.SpecOfResponse => ({
  type: 'response',
  name,
  response,
  // document,
})

//
// Path
//
export const selectPaths = (doc: openapi.Document) =>
  Object.entries(doc.paths).reduce(
    (arr, [pathTemplate, pathItem]) =>
      isDefined(pathItem)
        ? arr.concat(createPathSpec(pathTemplate, pathItem))
        : arr,
    [] as nsGenOps.SpecOfPath[],
  )

const createPathSpec = (
  pathTemplate: string,
  pathItem: openapi.PathItem,
  // document: openapi.Document,
): nsGenOps.SpecOfPath => ({
  type: 'path',
  pathTemplate,
  pathItem,
  // document,
})

//
// Operation
//
export const selectOperations = (doc: openapi.Document) =>
  Object.entries(doc.paths).reduce(
    (arr, [pathTemplate, pathItem]) =>
      isDefined(pathItem)
        ? arr.concat(processPath(pathTemplate, pathItem))
        : arr,
    [] as nsGenOps.SpecOfOperation[],
  )

export const createOperationSpec = (opData: {
  method: openapi.OperationType
  pathTemplate: string
  pathItem: openapi.PathItem
  operation: openapi.Operation
  // document: openapi.Document
}): nsGenOps.SpecOfOperation => ({
  type: 'operation',
  method: opData.method.toLowerCase() as openapi.OperationType,
  pathTemplate: opData.pathTemplate,
  pathItem: opData.pathItem,
  operation: opData.operation,
  // document: opData.document,
})

const OPEN_API_HTTP_METHODS = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
] as const

const processPath = (
  pathTemplate: string,
  pathItem: openapi.PathItem,
  // doc: openapi.Document,
) =>
  OPEN_API_HTTP_METHODS.filter((m) => pathItem[m]).map((method) =>
    createOperationSpec({
      method,
      pathTemplate,
      operation: pathItem[method]!,
      pathItem,
      // document: doc,
    }),
  )
