/**
 * 应用引导：i18n 初始化、tokens/tour 主题样式、启动时预取引导标记。
 * 旧前端由两个 Nuxt 客户端插件（i18n.client/tour.client）自动注入的工作在此显式完成。
 */
import { hydrateTours } from '@/shared/lib/tour'

// 顺序敏感：i18n 先于 React 渲染（首帧即有文案）；tour 水合 fire-and-forget
export function bootstrap() {
  void hydrateTours()
}
