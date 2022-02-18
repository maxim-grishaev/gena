export type DepsGraph<Val = readonly string[] | null> = Record<string, Val>

export const resolveDependencies = (depsGraph: DepsGraph) => {
  const endOrder: string[] = []
  const resolved: Record<string, true> = {}

  const visit = (moduleName: string, currentCycle: Record<string, true>) => {
    if (resolved[moduleName]) {
      return
    }

    // Is there a circular dependency?
    if (currentCycle[moduleName]) {
      const cycleString = Object.keys(currentCycle)
        .map((mdlName) => JSON.stringify(mdlName))
        .join(' -> ')
      throw new Error(`Circular dependency found: ${cycleString}`)
    }
    currentCycle[moduleName] = true

    const moduleDeps = depsGraph[moduleName] ?? []

    // Is there missing dependency?
    const missingDeps = moduleDeps.filter((mdlName) => !(mdlName in depsGraph))
    if (missingDeps.length > 0) {
      const missingDepsStr = missingDeps
        .map((mdlName) => JSON.stringify(mdlName))
        .join(', ')
      throw new Error(
        `Module "${moduleName}" depends on missing module: ${missingDepsStr}`,
      )
    }

    // Scan dependencies
    const unresolvedDeps = moduleDeps.filter((mdlName) => !resolved[mdlName])
    if (unresolvedDeps.length > 0) {
      unresolvedDeps.forEach((mdlName) => visit(mdlName, currentCycle))
    }

    // we assume we resolve it all or throw
    endOrder.push(moduleName)
    resolved[moduleName] = true
  }

  Object.keys(depsGraph).forEach((mdlName) => visit(mdlName, {}))
  return endOrder
}
