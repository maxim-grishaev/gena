import fsx from 'fs-extra'

import { useDiff, UseDiffParams } from './useDiff'

const getPrevValue = async (savedPath: string) => {
  if (!(await fsx.existsSync(savedPath))) {
    return null
  }
  return await fsx
    .readFile(savedPath)
    .then((fileData) => JSON.parse(fileData.toString()))
    .catch(() => null)
}

export const useDiffWithSavedJSON = async (params: {
  newValue: unknown
  savedPath: string
  title: string
  diffOptions?: UseDiffParams['diffOptions']
}) =>
  useDiff({
    newValue: params.newValue,
    prevValue: await getPrevValue(params.savedPath),
    title: `${params.title} for ${params.savedPath}`,
    diffOptions: params.diffOptions,
  })
