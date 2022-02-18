/* eslint-disable no-console */

import chalk from 'chalk'
import { useNamedTimesMeasures } from './useTimeMeasure'
import { useLogger } from './useLogger'

type Callback = () => Promise<void> | void
export const runner = async (
  title: string,
  instructions: () => Promise<Callback[]>,
) => {
  const logger = useLogger(`👾 ${title}`)
  const measure = useNamedTimesMeasures({
    total: true,
    instructions: false,
    postProcess: false,
  })
  const logResult = (
    title: string,
    ms: number,
    err: (Error & { code?: string }) | null,
  ) => {
    if (err) {
      logger.error(chalk.red`✘ ${title}: ${ms}ms ${err.code}`, err.message)
    } else {
      logger.ok(chalk.green`✔︎`, `${title}: ${ms}ms`)
    }
  }
  //
  // Start
  //
  logger.log('Start...')
  measure.start('instructions')

  let instructionsErr: Error | null = null
  const postProcessJobs = await instructions().catch((err: Error) => {
    instructionsErr = err
    return [] as Callback[]
  })

  logResult('Instructions', measure.stop('instructions'), instructionsErr)

  if (!instructionsErr) {
    measure.start('postProcess')

    const jobErr: Error | null = null
    await Promise.all(postProcessJobs.map((fn) => fn()))

    logResult('Post proccess', measure.stop('postProcess'), jobErr)
  }

  const TIMES = measure.read()
  logger.log(
    'Timing',
    chalk.dim`
Instructions: ${TIMES.instructions}ms
Post proccess:\t${TIMES.postProcess}ms
Total:\t${TIMES.total}ms

`,
  )
}
