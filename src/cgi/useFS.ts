import path from 'path'
import fsx from 'fs-extra'
import Vinyl from 'vinyl'

import { useLogger } from './useLogger'
import { sleep } from './lib'

type FilesMap = Map<string, Vinyl>

export const useFSPath =
  ({ cwd = process.cwd(), subDir = '' }: { cwd?: string; subDir?: string }) =>
  (relPath = '') =>
    path.resolve(cwd, subDir, relPath)

export const relativeToCwd = (filePath: string) =>
  path.relative(process.cwd(), filePath)

export const useReadFile = ({
  baseDir,
  afterRead,
}: {
  baseDir: string
  afterRead?: <I>(r: I) => unknown
}) => {
  const logger = useLogger('Read file')
  const getAbsPathInBaseDir = useFSPath({ subDir: baseDir })
  return {
    fileExists: (relPath: string) =>
      fsx.pathExists(getAbsPathInBaseDir(relPath)),

    readFile: async (
      relPath: string,
      options: { encoding?: string; flag?: string },
    ) => {
      const absPath = getAbsPathInBaseDir(relPath)
      logger.verbose(`${relPath} => ${relativeToCwd(absPath)}`)
      const result = await fsx.readFile(absPath, options)
      return afterRead ? await afterRead(result) : result
    },
  }
}

export const useWriteFile = ({
  baseDir,
  ignoreBeforeWrireErrors = false,
  cleanupBaseDir = true,
  beforeWrite,
  afterWrite,
  afterWriteAll,
}: {
  baseDir: string
  ignoreBeforeWrireErrors?: boolean
  cleanupBaseDir?: boolean
  beforeWrite?: (f: Vinyl) => Promise<Vinyl> | Vinyl | Promise<void> | void
  afterWrite?: (f: Vinyl) => Promise<Vinyl> | Vinyl | Promise<void> | void
  afterWriteAll?: (f: Vinyl[]) => void
}) => {
  const logger = useLogger('Write file')
  const filesMap: FilesMap = new Map()
  const getAbsPathInBaseDir = useFSPath({ subDir: baseDir })
  const baseAbsDir = getAbsPathInBaseDir()

  const preProcessFile = async (file: Vinyl) => {
    try {
      return (await beforeWrite!(file)) || file
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`\n\nbeforeWrite() issue @ ${relativeToCwd(file.path)}`)
        logger.error(err.message)
        logger.error(err.stack ?? '')
        // @ts-expect-error It's alright
        err.file = file
      }
      if (ignoreBeforeWrireErrors) {
        return file
      }
      throw err
    }
  }

  const writeOneFile = async (file: Vinyl) => {
    await fsx.outputFile(file.path, file.contents, file.meta)
    logger.verbose(relativeToCwd(file.path))
    if (afterWrite) {
      await afterWrite(file)
    }
    return file
  }

  const writeAllAddedFiles = async () => {
    const filesQueue = [...filesMap.values()]
    const allFiles = beforeWrite
      ? await Promise.all(filesQueue.map(preProcessFile))
      : filesQueue

    if (cleanupBaseDir) {
      logger.log(`Cleanup cwd: ${relativeToCwd(baseAbsDir)}`)
      await fsx.emptyDir(baseAbsDir)
    }

    if (allFiles.length) {
      logger.log(`Writing ${allFiles.length} files...`)
    }

    await Promise.all(allFiles.map(writeOneFile))

    if (allFiles.length) {
      logger.log(
        `${allFiles.length} files written. Starting post-processing...`,
      )
    }

    if (afterWriteAll) {
      await sleep(10)
      await afterWriteAll(allFiles)
    }

    if (allFiles.length > 0) {
      logger.ok('Post-processing done.')
    }
  }

  const addFileToWrite = (
    relPath: string,
    contents: ArrayBuffer | SharedArrayBuffer | string,
    meta?: unknown,
  ) => {
    const absPath = getAbsPathInBaseDir(relPath)

    const file = new Vinyl({
      cwd: baseDir,
      path: absPath,
      contents:
        typeof contents === 'string'
          ? Buffer.from(contents)
          : Buffer.from(contents),
      meta,
    })
    filesMap.set(absPath, file)
    return file
  }

  return {
    addFileToWrite,
    writeAllAddedFiles,
  }
}
useWriteFile.debug = false
