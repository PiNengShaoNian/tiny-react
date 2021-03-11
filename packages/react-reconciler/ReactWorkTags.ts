export type WorkTag =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24

export const FunctionComponent = 0

export const HostRoot = 3 // Root of a host tree. Could be nested inside another node.
export const HostText = 6;
export const IndeterminateComponent = 2; // Before we know whether it is function or class
export const ClassComponent = 1;
