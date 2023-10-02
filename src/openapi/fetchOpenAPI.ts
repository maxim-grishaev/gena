import type { openapi } from './types/opanapi'
import SwaggerParser from '@apidevtools/swagger-parser'
import { OpenAPI } from 'openapi-types'
import swagger2openapi from 'swagger2openapi'

const isSwagger2Document = (
  doc: OpenAPI.Document & { swagger?: unknown },
): doc is openapi.V2Document => Boolean(doc.swagger) && doc.swagger === '2.0'

export const fetchOpenAPI = async (
  definitionURLorPath: string,
  options: SwaggerParser.Options['resolve'] = {},
) => {
  const apiDefinitionV2OrV3 = await SwaggerParser.bundle(definitionURLorPath, {
    dereference: {
      circular: 'ignore',
    },
    resolve: {
      file: {
        canRead: true,
      },
      ...options,
    },
    validate: {
      schema: true,
      spec: false,
    },
  })

  return isSwagger2Document(apiDefinitionV2OrV3)
    ? await swagger2openapi.convert(apiDefinitionV2OrV3)
    : (apiDefinitionV2OrV3 as openapi.Document)
}
