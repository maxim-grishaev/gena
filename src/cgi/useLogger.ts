import chalk from 'chalk'

useLogger.isVerbose = false
type MessageType = 'log' | 'ok' | 'debug' | 'error'
useLogger.messages = [] as [MessageType, string, string, unknown][]

export function useLogger(
  name: string,
  { isVerbose = useLogger.isVerbose } = {},
) {
  const createLog =
    (name: string, color: (text: string) => string, msgType: MessageType) =>
    (msg: string, data: unknown = '') => {
      useLogger.messages.push([msgType, name, msg, data])
      // eslint-disable-next-line no-console
      if (isVerbose) {
        console.log(chalk.dim`[${msgType}]\t`, color(name), msg, data)
      } else {
        console.log(color(name), msg, data)
      }
    }

  const logDebug = createLog(name, chalk.yellow, 'debug')
  return {
    name,
    verbose: (msg: string) => {
      if (isVerbose) {
        logDebug(chalk.dim(msg))
      }
    },
    log: createLog(name, chalk.blueBright, 'log'),
    ok: createLog(name, chalk.green, 'ok'),
    error: createLog(name, chalk.red, 'error'),
  }
}
