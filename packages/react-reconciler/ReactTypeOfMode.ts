export type TypeOfMode = number;

export const NoMode = /*            */ 0b000000;
// TODO: Remove BlockingMode and ConcurrentMode by reading from the root tag instead
export const BlockingMode = /*      */ 0b000001;
export const ConcurrentMode = /*    */ 0b000010;
