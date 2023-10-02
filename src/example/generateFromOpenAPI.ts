import type * as nsGenImpl from '@gena/openapi/types/Impl'
import path from 'path'
// import fs from 'fs'
import type Vinyl from 'vinyl'
import { runner } from '@gena/core/runner'
import { useLogger } from '@gena/core/useLogger'
import { prettifyWithEslint, prettifyJSON } from '@gena/core/prettify'
import { useDiffWithSavedJSON } from '@gena/core/useDiffWithSavedJSON'
import { useWriteFile, useReadFile } from '@gena/core/useFS'
import { relativeToCwd, useFSPath } from '@gena/core/useFSPath'
import { fetchOpenAPI } from '@gena/openapi/fetchOpenAPI'
import { selectEnums, selectStructs } from '@gena/openapi/traverse/selectEntity'
import {
  selectResponses,
  selectOperations,
  selectPaths,
} from '@gena/openapi/traverse/selectOperation'
import { renderOneStruct, getStructName } from './templates/renderStruct'
import {
  renderOneOperation,
  getOperationName,
} from './templates/renderOperation'
import { renderOneEnum, getEnumName } from './templates/renderEnum'

const updateFileBody = async (stringContents: string, file: Vinyl) => {
  file.contents = Buffer.from(stringContents)
  return file
}

const addJsHeader = (apiName: string, version: string, file: Vinyl) =>
  `
/*
=================
 AUTO GENERATED!
 API "${apiName}" version: ${version}
 ${file.relative}
=================
 */
${String(file.contents).trim()}
`.trim()

export const generateFromOpenAPI = async ({
  title,
  outDir,
  // aliases = {},
  templateVars = {},
  cwd,
  schemaOptions,
  pathPrefixes,
  ...rest
}: nsGenImpl.GeneratorInput) =>
  await runner(title, async () => {
    if (!outDir) {
      throw new Error('outDir prop is missing')
    }
    const logger = useLogger(title)
    const getAbsPathInOutputDir = useFSPath({ cwd, subDir: outDir })
    const getAbsPathInCWD = useFSPath({ cwd, subDir: '' })
    const baseDir = getAbsPathInOutputDir()
    logger.log('Output dir:', relativeToCwd(baseDir))

    const apiURL = 'url' in rest ? rest.url : getAbsPathInCWD(rest.filePath)
    if ('url' in rest) {
      logger.log('API url', apiURL)
    } else {
      logger.log('API path', relativeToCwd(apiURL))
    }
    logger.log('API schemaOptions', schemaOptions)
    const document = await fetchOpenAPI(apiURL, schemaOptions).catch((err) => {
      logger.error('fetchOpenAPI')
      console.error(err)
      throw err
    })
    logger.ok('API parsed')

    const { addFileToWrite, writeAllAddedFiles } = useWriteFile({
      baseDir,
      cleanupBaseDir: true,
      ignoreBeforeWrireErrors: true,
      beforeWrite: async (file) => {
        const extname = path.extname(file.path)
        switch (extname) {
          case '.js':
          case '.ts':
          case '.tsx':
            updateFileBody(
              addJsHeader(title, document.info.version, file),
              file,
            )
            updateFileBody(
              await prettifyWithEslint(file, {
                cwd,
              }),
              file,
            )
            break
          case '.json':
            updateFileBody(prettifyJSON(file), file)
            break
        }
      },
    })
    const { fileExists } = useReadFile({ baseDir })

    //
    // Check API diff
    //
    const schemaJSONRelPath = `./${title}.openapi.json`

    const diffRelPath = `${schemaJSONRelPath}.diff`
    if (await fileExists(diffRelPath)) {
      const relPath = relativeToCwd(getAbsPathInOutputDir(diffRelPath))
      throw new Error(`Abort because diff file was found: ${relPath}`)
    }
    const jsonDiff = await useDiffWithSavedJSON({
      newValue: document,
      savedPath: getAbsPathInOutputDir(schemaJSONRelPath),
      title: 'API definition',
    })

    const vars = {
      enums: selectEnums(document),
      structs: selectStructs(document),
      paths: selectPaths(document),
      operations: selectOperations(document),
      responses: selectResponses(document),
      document,
      templateVars,
    }

    //
    // Generate files
    //
    addFileToWrite(schemaJSONRelPath, JSON.stringify(document, null, '\t'))
    logger.ok('schema')

    if (jsonDiff.hasDiff) {
      addFileToWrite(diffRelPath, jsonDiff.diff)
      logger.ok('diff file')
    }

    for (const struct of vars.structs) {
      addFileToWrite(
        `structs/${getStructName(struct)}.ts`,
        renderOneStruct(struct, document),
      )
    }
    logger.ok(`structs: ${vars.structs.length}`)

    for (const enm of vars.enums) {
      const enumName = getEnumName(enm)
      addFileToWrite(`enum/${enumName}.ts`, renderOneEnum(enumName, enm))
    }
    logger.ok(`enums: ${vars.enums.length}`)

    for (const op of vars.operations) {
      const operationName = getOperationName(pathPrefixes, op)
      addFileToWrite(
        `operation/${operationName}.ts`,
        renderOneOperation(operationName, op, document),
      )
    }
    logger.ok(`operations: ${vars.operations.length}`)

    return [
      writeAllAddedFiles,
      () => {
        if (jsonDiff.hasDiff) {
          logger.error('Diff found\n', jsonDiff.diff)
        } else {
          logger.ok('No changes')
        }
      },
    ]
  })
