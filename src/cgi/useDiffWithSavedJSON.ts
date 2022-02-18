import fsx from 'fs-extra'

import { useDiff, UseDiffParams } from './useDiff'

export const useDiffWithSavedJSON = async (params: {
  newValue: unknown
  savedPath: string
  title: string
  diffOptions?: UseDiffParams['diffOptions']
}) => {
  const getPrevValue = async () => {
    if (!(await fsx.existsSync(params.savedPath))) {
      return null
    }
    return await fsx
      .readFile(params.savedPath)
      .then((fileData) => JSON.parse(fileData.toString()))
      .catch(() => null)
  }
  return useDiff({
    newValue: params.newValue,
    prevValue: await getPrevValue(),
    title: `${params.title} for ${params.savedPath}`,
    diffOptions: params.diffOptions,
  })
}
