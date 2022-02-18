import { DepsGraph } from './resolveDependencies'

export type GraphOfImportedBy = Record<string, Record<string, true>>

export const getGraphOfImportedBy = (depsGraph: DepsGraph) => {
  const importedBy: GraphOfImportedBy = {}
  Object.keys(depsGraph).forEach((mdlName) => {
    const moduleDeps = depsGraph[mdlName] ?? []
    moduleDeps.forEach((dep) => {
      if (!importedBy[dep]) {
        importedBy[dep] = {}
      }
      importedBy[dep][mdlName] = true
    })
  })
  return importedBy
}
