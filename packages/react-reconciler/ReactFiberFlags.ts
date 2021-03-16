export type Flags = number

export const NoFlags = /*                      */ 0b000000000000000000000

export const Placement = /*                    */ 0b000000000000000000010
export const Update = /*                       */ 0b000000000000000000100
export const PlacementAndUpdate = /*           */ Placement | Update
export const Deletion = /*                     */ 0b000000000000000001000
export const ChildDeletion = /*                */ 0b000000000000000010000
export const ContentReset = /*                 */ 0b000000000000000100000

export const MutationMask = Placement | Update | ChildDeletion | ContentReset

export const BeforeMutationMask = Update
