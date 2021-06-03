export type HookFlags = number

export const NoFlags = /*   */ 0b000

// 表示了是否因该触发改effect
export const HasEffect = /* */ 0b001

//表示了effect触发是所处的阶段
export const Layout = /*    */ 0b010
export const Passive = /*   */ 0b100
