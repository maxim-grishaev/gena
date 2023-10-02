import type * as nsGenOps from '@gena/openapi/types/Ops'
import type { openapi } from '@gena/openapi/types/opanapi'
import { OpenAPIV3 } from 'openapi-types'
import { EntityGuard } from '@gena/openapi/traverse/EntityGuard'
import { deref } from '@gena/openapi/traverse/deref'
import { isDefined } from '@gena/openapi/util'
import { printObject } from './lib/printTS'
import { printType } from './lib/printType'
import { toCamelCase } from './lib/strings'

export const getOperationName = (
  pathPrefixes: string[] | undefined,
  op: nsGenOps.SpecOfOperation,
) => {
  let { pathTemplate } = op
  if (pathPrefixes) {
    pathTemplate = pathPrefixes.reduce(
      (memo, prefix) =>
        memo.startsWith(prefix) ? memo.replace(prefix, '') : memo,
      pathTemplate,
    )
  }
  const pathParts = pathTemplate
    .split('/')
    .filter((section) => !section.startsWith('{'))
  return toCamelCase([op.method, ...pathParts])
}

type Param = OpenAPIV3.ParameterObject
const filterParamsIn = (inVal: string, params: Param[]) =>
  params.filter((p) => p.in === inVal)

const isParam = (entity: unknown): entity is Param =>
  entity != null &&
  typeof entity === 'object' &&
  'name' in entity &&
  typeof entity.name === 'string' &&
  'in' in entity &&
  typeof entity.in === 'string'

export const renderOneOperation = (
  opName: string,
  spec: nsGenOps.SpecOfOperation,
  doc: openapi.Document,
) => {
  const params = (spec.pathItem.parameters || [])
    .map((param) => {
      if (!EntityGuard.isRef(param)) {
        return param
      }
      const selectedVal = deref(doc, param)
      if (isParam(selectedVal)) {
        return selectedVal
      }
      return null
    })
    .filter(isDefined)

  const paramType = printObject(
    params.map((param) => ({
      key: param.name,
      value: param.schema ? printType(doc, param.schema) : 'string',
    })),
  )

  const paramArg = params.length > 0 ? `params: ${paramType}` : ''
  const headers = filterParamsIn('header', params).map((p) => ({
    key: p.name,
    value: `params.${p.name}`,
  }))
  const bodyParams = filterParamsIn('body', params).map((p) => ({
    key: p.name,
    value: `params.${p.name}`,
  }))

  const path = [
    '`',
    spec.pathTemplate.split('/{').join('/${params.'),
    '`',
  ].join('')

  const queryParams = filterParamsIn('query', params).map(
    (p) => `${p.name}=encodeURIComponent(params.${p.name})`,
  )

  const url = [path, queryParams.length > 0 ? queryParams.join('&') : null]
    .filter(isDefined)
    .join('?')

  const fetchParams = printObject(
    [
      { key: 'method', value: JSON.stringify(spec.method) },
      headers.length === 0
        ? null
        : {
            key: 'headers',
            value: printObject(headers),
          },
      bodyParams.length === 0
        ? null
        : { key: 'body', value: printObject(bodyParams) },
    ].filter(isDefined),
  )
  return [
    `export const ${opName} = async (fetch: Window['fetch'], ${paramArg}) =>`,
    `fetch(${url}, ${fetchParams});`,
    '/*',
    JSON.stringify(spec.pathItem[spec.method], null, '\t'),
    '*/',
  ].join('\n\n')
}

export const renderManyOperations = (
  pathPrefixes: string[] | undefined,
  operations: nsGenOps.SpecOfOperation[],
  doc: openapi.Document,
) =>
  operations
    .map((op) =>
      renderOneOperation(getOperationName(pathPrefixes, op), op, doc),
    )
    .join('\n\n')
