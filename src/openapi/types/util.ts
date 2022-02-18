export namespace util {
  export type PropDefined<Obj, K extends keyof Obj> = Omit<Obj, K> &
    Required<Pick<Obj, K>>
}
