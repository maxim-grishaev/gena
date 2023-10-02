import path from 'path'

export const useFSPath =
  ({ cwd = process.cwd(), subDir = '' }: { cwd?: string; subDir?: string }) =>
  (relPath = '') =>
    path.resolve(cwd, subDir, relPath)

export const relativeToCwd = (filePath: string) =>
  path.relative(process.cwd(), filePath)
