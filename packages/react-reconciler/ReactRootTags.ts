export type RootTag = 0 | 1 | 2

/**
 * 通过React.render调用时创建的FiberRoot为该值
 */
export const LegacyRoot = 0
export const BlockingRoot = 1
/**
 * 通过React.createRoot调用时创建的FiberRoot为该值
 */
export const ConcurrentRoot = 2
