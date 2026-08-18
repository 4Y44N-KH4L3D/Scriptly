import type { Dispatch as ReactDispatch, SetStateAction as ReactSetStateAction } from 'react'

declare global {
  type Dispatch<A> = ReactDispatch<A>
  type SetStateAction<S> = ReactSetStateAction<S>
}

export {}
