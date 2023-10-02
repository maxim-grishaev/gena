import { diff as jestDiff } from 'jest-diff'
import stripAnsi from 'strip-ansi'

export interface UseDiffParams {
  newValue: unknown
  prevValue: unknown
  diffOptions?: Parameters<typeof jestDiff>[2]
  title: string
}

export const useDiff = async ({
  newValue,
  prevValue,
  diffOptions = {},
}: UseDiffParams) => {
  const hasDiff =
    prevValue != null && JSON.stringify(prevValue) !== JSON.stringify(newValue)

  const diff = hasDiff
    ? jestDiff(prevValue, newValue, {
        aAnnotation: 'saved',
        bAnnotation: 'new',
        contextLines: 3,
        expand: false,
        ...diffOptions,
      })
    : null

  return hasDiff
    ? {
        hasDiff,
        diff: stripAnsi(diff || ''),
      }
    : {
        hasDiff,
        diff: null,
      }
}
