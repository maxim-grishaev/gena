declare module 'swagger2openapi' {
  import { OpenAPIV2, OpenAPIV3 } from 'openapi-types'
  type S2OA = {
    convert: (swagger: OpenAPIV2.Document) => Promise<OpenAPIV3.Document>
  }
  const S2OA: S2OA
  export = S2OA
}
