export const printComment = (text: (string | null | undefined)[]) =>
  `
/**
 * ${text.filter(Boolean).join('\n').trim().split('\n').join(`\n * `)}
 */
`.trim()

export interface ObjectPropSpec {
  key: string
  value: string
  comment?: string
}
export const printObject = (entries: ObjectPropSpec[]) =>
  [
    `{`,
    entries
      .map(({ key, value, comment }) => `${comment || ''}\n${key}:${value}`)
      .join(','),
    `}`,
  ].join(' ')
