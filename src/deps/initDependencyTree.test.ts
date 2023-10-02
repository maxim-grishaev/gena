import {
  initDependencyTree,
  initValidDependencyTree,
} from './initDependencyTree'
import { DepsGraph } from './resolveDependencies'

const runCase = async (depTree: DepsGraph) => {
  const modulesOrderList: string[] = []
  await initDependencyTree((mdlName: string) => {
    modulesOrderList.push(mdlName)
  }, depTree)
  return modulesOrderList
}

describe('initDependencyTree', () => {
  test('callback is awaited', async () => {
    const mockLater = jest.fn()
    const mock = jest
      .fn()
      .mockImplementation(() => Promise.resolve(null).then(mockLater))
    await initDependencyTree(mock, {
      a: [],
    })
    expect(mockLater).toHaveBeenCalledTimes(1)
  })

  test('single module', async () => {
    expect(
      await runCase({
        a: [],
      }),
    ).toEqual(['a'])
  })

  test('a -> b', async () => {
    expect(
      await runCase({
        a: ['b'],
        b: [],
      }),
    ).toEqual(['b', 'a'])
  })

  test('2 items depends on same module: a -> x, c -> x', async () => {
    expect(
      await runCase({
        a: ['x'],
        x: [],
        c: ['x'],
      }),
    ).toEqual(['x', 'a', 'c'])
  })

  test('longer chain a -> b -> c', async () => {
    expect(
      await runCase({
        a: ['b'],
        b: ['c'],
        c: [],
      }),
    ).toEqual(['c', 'b', 'a'])
  })

  test('complex case', async () => {
    expect(
      await runCase({
        a: ['b', 'c'],
        b: ['c'],
        c: [],
        d: ['c'],
        e: [],
        x: ['a'],
      }),
    ).toEqual(['c', 'e', 'b', 'd', 'a', 'x'])
  })

  test('circular dependency', async () => {
    await expect(
      runCase({
        a: ['b'],
        b: ['c'],
        c: ['b'],
      }),
    ).rejects.toThrow()
  })
})

const runCaseWithValid = async (depTree: DepsGraph) => {
  const modulesOrderList: string[] = []
  await initValidDependencyTree((mdlName: string) => {
    modulesOrderList.push(mdlName)
  }, depTree)
  return modulesOrderList
}

describe('initValidDependencyTree', () => {
  test('circular dependency', async () => {
    await expect(
      runCaseWithValid({
        a: ['b'],
        b: ['c'],
        c: ['x', 'b'],
        x: [],
      }),
    ).rejects.toThrow()
  })
})

describe('What if we fail to init?', () => {
  it('should report error if throws', async () => {
    await expect(() =>
initValidDependencyTree(
(moduleName) => {
  throw new Error(`"${moduleName}" threw`);
},
{
  throw_case: [] })).


rejects.toThrowErrorMatchingInlineSnapshot(`""throw_case" threw"`)
  })
  it('should report error if rejects', async () => {
    await expect(() =>
initValidDependencyTree(
(moduleName) => Promise.reject(new Error(`"${moduleName}" threw`)),
{
  reject_case: [] })).


rejects.toThrowErrorMatchingInlineSnapshot(`""reject_case" threw"`)
  })

  it('should report correct error', async () => {
    await expect(() =>
      initValidDependencyTree(
        (moduleName) => {
          if (moduleName === 'fail') {
            throw new Error(`NO WAI: ${moduleName}`)
          }
          return Promise.resolve(null)
        },
        {
          ok: [],
          fail: ['ok'],
        },
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"NO WAI: fail"`)
  })

  it('should report first correct error', async () => {
    await expect(() =>
      initValidDependencyTree(
        (moduleName) => {
          if (moduleName.startsWith('fail')) {
            throw new Error(`NO WAI: ${moduleName}`)
          }
          return Promise.resolve(null)
        },
        {
          ok: [],
          fail1: ['ok'],
          fail2: ['ok'],
        },
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"NO WAI: fail1"`)
  })
})
