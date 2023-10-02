import { resolveDependencies, DepsGraph } from './resolveDependencies'

describe('can resolve simple graph', () => {
  it.each([
    {
      given: { a: [] } as DepsGraph,
      expected: ['a'],
      desc: 'single module',
    },
    {
      given: { a: [], x: null } as DepsGraph,
      expected: ['a', 'x'],
      desc: 'No dependencies: a: [], x: null',
    },
    {
      given: { a: ['b'], b: [] } as DepsGraph,
      expected: ['b', 'a'],
      desc: 'One dependency: a -> b',
    },
  ])('$desc', (data) => {
    expect(resolveDependencies(data.given)).toEqual(data.expected)
  })
})

describe('can resolve complex graph', () => {
  it.each([
    {
      given: {
        a: ['c'],
        b: ['a'],
        c: [],
      } as DepsGraph,
      expected: ['c', 'a', 'b'],
    },
    {
      given: {
        a: ['c', 'd'],
        b: ['a'],
        c: null,
        d: [],
      } as DepsGraph,
      expected: ['c', 'd', 'a', 'b'],
    },
  ])('$expected', (data) => {
    expect(resolveDependencies(data.given)).toEqual(data.expected)
  })
})

describe('missing dependencies', () => {
  it('throws if missing the one', () => {
    expect(() =>
resolveDependencies({
  a: ['b'] })).

toThrowErrorMatchingInlineSnapshot(`"Module "a" depends on missing module: "b""`)
  })
  it('throws if missing within existing', () => {
    expect(() =>
resolveDependencies({
  a: ['b', 'c'],
  b: [] })).

toThrowErrorMatchingInlineSnapshot(`"Module "a" depends on missing module: "c""`)
  })
})

describe('throws if circular dependency found', () => {
  it('throws if simple circular dependency a <-> b', () => {
    expect(() =>
resolveDependencies({
  a: ['b'],
  b: ['a'] })).

toThrowErrorMatchingInlineSnapshot(`"Circular dependency found: "a" -> "b""`)
  })
  it('throws if long circular dependency a -> b -> c -> d -> a', () => {
    expect(() =>
resolveDependencies({
  a1: ['c2'],
  b3: ['d0'],
  c2: ['b3'],
  d0: ['a1'] })).

toThrowErrorMatchingInlineSnapshot(`"Circular dependency found: "a1" -> "c2" -> "b3" -> "d0""`)
  })
})
