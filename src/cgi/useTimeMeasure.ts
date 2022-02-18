export const useTimeMeasure = () => {
  const start = Date.now()
  return () => Date.now() - start
}

const count0 = () => 0
export const useNamedTimesMeasures = <T extends Record<string, boolean>>(
  props: T,
) => {
  type Key = keyof T
  const keys: Key[] = Object.keys(props)
  const getTimeFromStart = useTimeMeasure()
  const timerMap = keys.reduce((memo, k) => {
    memo[k] = props[k] ? getTimeFromStart : count0
    return memo
  }, {} as Record<Key, () => number>)

  const stopTimeMap: { [K in Key]?: number } = {}

  return {
    start: (key: Key) => {
      timerMap[key] = useTimeMeasure()
      stopTimeMap[key] = undefined
    },
    stop: (key: Key): number => {
      stopTimeMap[key] = timerMap[key]()
      return stopTimeMap[key]!
    },
    read: (): Record<Key, number> =>
      keys.reduce((memo, k) => {
        const stopTime: number | undefined = stopTimeMap[k]
        memo[k] = stopTime != null ? stopTime : timerMap[k]()
        return memo
      }, {} as Record<Key, number>),
  }
}
