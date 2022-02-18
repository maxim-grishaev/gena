import type { openapi } from './types/opanapi'
import SwaggerParser from '@apidevtools/swagger-parser'
import swagger2openapi from 'swagger2openapi'

const isV2 = (doc: Partial<openapi.V2Document>): doc is openapi.V2Document =>
  Boolean(doc.swagger)

export const fetchOpenAPI = async (
  definitionURLorPath: string,
  options: SwaggerParser.Options['resolve'] = {},
) => {
  const apiDefinitionV2OrV3 = await SwaggerParser.bundle(definitionURLorPath, {
    dereference: {
      circular: 'ignore',
    },
    resolve: options,
    validate: {
      schema: true,
      spec: false,
    },
  })

  return isV2(apiDefinitionV2OrV3)
    ? await swagger2openapi.convert(apiDefinitionV2OrV3)
    : apiDefinitionV2OrV3
}
