import { resolveDependencies, DepsGraph } from './resolveDependencies'

export const initValidDependencyTree = (
  init: (mdlName: string) => unknown | Promise<unknown>,
  depsGraph: DepsGraph,
) => {
  const startedInit: Record<string, true> = {}
  const finishedInit: Record<string, true> = {}
  const MAX_ITERATIONS = Object.keys(depsGraph).length + 1
  let iteration = 0

  const initOneModule = (mdlName: string) => {
    startedInit[mdlName] = true
    return new Promise((resolve) => {
      resolve(init(mdlName))
    })
      .then(() => {
        finishedInit[mdlName] = true
      })
      .then(tryInitMoreModules)
  }

  const tryInitMoreModules = (): Promise<null> => {
    // Should never happen, but prevents infinite loops
    if (iteration++ > MAX_ITERATIONS) {
      return Promise.reject(
        new Error(`Something wrong. Too many iterations: ${MAX_ITERATIONS}`),
      )
    }

    const readyToInit = Object.keys(depsGraph)
      // Only modules that was not picked up yet
      .filter((mdlName) => !startedInit[mdlName])
      .filter((mdlName) => {
        // Pick up modules that have no pending dependencies
        const moduleDeps = depsGraph[mdlName] ?? []
        return moduleDeps.every((dep) => finishedInit[dep])
      })

    // init all the ready to init modules
    if (readyToInit.length > 0) {
      return Promise.all(readyToInit.map(initOneModule)).then(null)
    }

    // Nothing to init. Do we have any pending deps?

    // Some modules still in progress, wait for next callback
    const numberOfStarted = Object.keys(startedInit).length
    const numberOfFinished = Object.keys(finishedInit).length
    if (numberOfStarted !== numberOfFinished) {
      return Promise.resolve(null)
    }

    // Nothing in process
    const missingModules = Object.keys(depsGraph).filter(
      (mdlName) => !startedInit[mdlName],
    )
    // Weird situation: no modules ready to init,
    // nothing in progress but some modules are still pending
    // Probably it's a circular dependency case
    if (missingModules.length > 0) {
      const missingStr = missingModules.join(', ')
      return Promise.reject(
        new Error(
          [
            `Some modules are not initialised: ${missingStr}.`,
            'Circular dependencies?',
          ].join('\n'),
        ),
      )
    }

    // All finished OK
    return Promise.resolve(null)
  }

  return tryInitMoreModules()
}

export const initDependencyTree = (
  init: (mdlName: string) => unknown | Promise<unknown>,
  depsGraph: DepsGraph,
) =>
  new Promise((ok) => {
    resolveDependencies(depsGraph)
    ok(null)
  }).then(() => initValidDependencyTree(init, depsGraph))
