export const renderNS = (ns: string, contents: string) =>
  [`export namespace ${ns} {`, contents, '}'].join('\n')
