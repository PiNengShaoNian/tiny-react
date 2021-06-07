export type Flags = number

export const NoFlags = /*                      */ 0b00000000000000000000000

export const Placement = /*                    */ 0b00000000000000000000010
export const Update = /*                       */ 0b00000000000000000000100
export const PlacementAndUpdate = /*           */ Placement | Update
export const Deletion = /*                     */ 0b00000000000000000001000
export const ChildDeletion = /*                */ 0b00000000000000000010000
export const ContentReset = /*                 */ 0b00000000000000000100000
export const Passive = /*                      */ 0b00000000000010000000000

export const MutationMask = Placement | Update | ChildDeletion | ContentReset
export const LayoutMask = Update

export const BeforeMutationMask = Update

export const PassiveMask = Passive | ChildDeletion

// Static tags describe aspects of a fiber that are not specific to a render,
// e.g. a fiber uses a passive effect (even if there are no updates on this particular render).
// This enables us to defer more work in the unmount case,
// since we can defer traversing the tree during layout to look for Passive effects,
// and instead rely on the static flag as a signal that there may be cleanup work.
export const RefStatic = /*                    */ 0b00001000000000000000000
export const LayoutStatic = /*                 */ 0b00010000000000000000000
export const PassiveStatic = /*                */ 0b00100000000000000000000

// Union of tags that don't get reset on clones.
// This allows certain concepts to persist without recalculting them,
// e.g. whether a subtree contains passive effects or portals.
export const StaticMask = LayoutStatic | PassiveStatic | RefStatic
