# frontend-react — React 版前端（Vue → React 重构 + Tailwind 样式层）

按《Vue → React 生产级前端重构计划》与《CSS → Tailwind CSS 生产级重构计划》（飞书文档）实施的新前端。与旧 Vue 前端（`frontend/`，端口 3013）并行开发，切换发布（P7）前旧前端不受影响。

## 技术栈

React 19 + TypeScript(strict) + Vite 7 + Tailwind CSS v4（@tailwindcss/vite，CSS-first 配置）+ React Router 7（Data Mode）+ TanStack Query v5 + Zustand v5 + React Hook Form + Zod + Radix Dialog/AlertDialog + cva + clsx + tailwind-merge + i18next + lucide-react + sonner + driver.js。

## 样式架构（Tailwind v4）

统一入口 `src/app/styles/index.css`（main.tsx 唯一样式导入），层顺序：

```
theme → base → vendor → legacy → components → utilities
```

| 文件 | 职责 |
|-|-|
| `runtime-tokens.css` | 全部原始设计值 `--hb-*`（light/dark 双主题，token 注册表） |
| `theme.css` | `@theme inline` 语义映射（bg-app/text-content/rounded-panel/shadow-card…）、`@custom-variant dark`（读 html[data-theme]）、旧断点变体 `max-760/860/900/1080`、自定义 utility（`bg-brand-gradient`/`shadow-focus`/`shadow-brand-glow`/`animate-skeleton-pulse`） |
| `base.css` | 页面根节点与必要基础规则（Preflight 未启用，独立批次验收后接入） |
| `legacy-bridge.css` | **有退出期限**：旧变量 alias（`--surface-base` 等 → `--hb-*`）+ 旧全局组件类（`.btn/.tag/.card/.input/.dialog/.overlay/.seg/.switch/.app-menu-*` 等）。新代码禁止引用 |
| `vendor-overrides.css` | driver.js 主题覆盖（受控 !important，layer: components） |
| `exceptions.css` | 有用途/owner/删除条件的 CSS 例外登记 |

未迁移 CSS Modules 是无层规则，优先级高于全部 layer（与迁移前的导入顺序胜出关系一致）；同一元素上 Tailwind utility（最后层）可覆盖 legacy 类。

### 组件 variants

`shared/ui/button.tsx`（Button/IconButton，variant: default/primary/ghost/danger × size: default/sm/icon + loading）、`input.tsx`（Input/Textarea，size/invalid）、`badge.tsx`（Badge，tone 六色 + mono）、`card.tsx`（interactive/selected）、`spinner.tsx`。类名表为完整静态字符串（可扫描）；`shared/lib/cn.ts`（clsx + tailwind-merge，自定义 token 分组有契约测试）。

### 迁移状态（T7 已完成：无 legacy CSS）

**全部 CSS Modules 与 legacy-bridge 均已删除**。样式只存在于四处有明确职责的文件：

- `runtime-tokens.css` — `--hb-*` 原始设计值（light/dark，唯一 token 来源）
- `theme.css` — `@theme inline` 语义映射 + dark/max-* 变体 + 动画 token + `bg-brand-gradient`/`shadow-focus` 等自定义 utility
- `base.css` — 自有 reset（Preflight 未启用）；`vendor-overrides.css` — driver.js 覆盖（已切 `--hb-*`）
- `exceptions.css` — 登记例外：滚动条 webkit 规则（有 owner 与删除条件）；reduced-motion 汇总待接入

**JSX 中不存在任何旧全局类**（.btn/.tag/.card/.input/.textarea/.dialog/.overlay/.seg/.switch/.dim/.mono/.field/.app-menu-* 已全部替换）：

- 按钮一律 `buttonVariants({variant,size})` / `<Button>/<IconButton>`；徽标 `badgeVariants`/`<Badge tone>`；卡片 `cardVariants()`；输入 `<Input>/<Textarea>`；开关 `<Switch checked>`；圆环加载 `<RingSpinner>`；菜单面板/菜单项为 AppMenu/AppMenuItem 内联 utilities
- 动画走 token：`animate-fade-in` / `animate-fade-up` / `animate-scale-in` / `animate-menu-in(-top)` / `animate-skeleton-pulse`
- 引导锚点保留：`.nav-link`、`.head-actions`、`data-tour="create-project"`、`.quick-card`、`.settings-nav .nav-item`、`.studio-topbar-main`、`.pipe-section`、`.studio-actions .tour-help-btn`

### 已知的转换期等价处理（视觉无差异，记录在案）

- 工作台三栏栅格 `--vleft/--vright`、浮层定位保持 inline style（文档规定的运行时值模式）
- 侧栏脉冲/跑马灯/抽屉滑入的 @keyframes 内联在对应组件的 `<style>` 中（原模块 css 的 keyframes 随文件删除）
- `body.is-video-col-dragging` 改为拖拽期间直接设置 `document.body.style.cursor/userSelect`
- 旧 Vue 中因 CSS Modules 哈希从未真正生效的死类（如部分 `.epCard*` 变体、`assetDetailFootInner`）已按「等价原则」去除或补齐，详见各文件头部注释
- 修复：MentionTextarea 高亮 token 类在 CSS Modules 下被哈希导致样式失配（React 版高亮直接用静态 Tailwind 类，bug 顺带修复）

## 命令

```bash
npm run dev         # 开发（端口 3014，/api 与 /static 代理到 localhost:5679）
npm run build       # tsc --noEmit + vite build → dist/（含 index.html，可静态托管）
npm run typecheck   # 类型检查
npm run test        # Vitest（cn 合并语义 + 工作台纯函数 + DTO + 偏好迁移）
npm run lint        # ESLint
```

后端：仓库根 `npm run dev:backend`（Hono，端口 5679）。生产部署把 `frontend-react/dist` 交给后端（`FRONTEND_DIST` 环境变量）或复制到 `frontend/dist`，与旧版交付方式一致。

## 架构（依赖方向：app/routes → features → entities → shared）

```
src/
  app/            providers（QueryClient/Toaster/迁移遮罩）、router（四条路由）、layouts、styles/（Tailwind 入口）
  routes/         4 个路由入口（lazy 分包）：/ 、/settings、/drama/:id、/drama/:id/episode/:episodeNumber
  features/       业务模块：projects / drama-detail / settings / workbench / preferences / desktop-operations
  entities/       领域层：drama / episode / asset / storyboard / generation-task / ai-config / settings
                  （api + model(DTO mapper) + queries(queryOptions)）
  shared/         api client（envelope/超时/AbortSignal/脱敏日志）、config（偏好 store/主题/i18n）、ui（variants 组件 + 旧控件）、lib（cn/media/errors/tour…）
```

- **服务端数据唯一入口是 React Query**；queryKey 以 workspace scope + 数据库 ID 为锚点（`shared/api/query-keys.ts`）。
- **工作台聚合任务同步**：`GET /episodes/:id/generation-tasks` 单一 jobs 查询按需 4s 轮询，视频 pending/失败状态从 jobs 派生（每个分镜取最新一条任务重建），替代旧版散布的手动定时器；终态 toast 由快照转移检测去重。
- **交互状态**：全局偏好（主题/语言/侧栏/栏宽/模型选择/面板记忆）在 persisted Zustand store（新键 `huobao:prefs:v1`，启动时从旧 `huobao:*` 逐键迁移，旧键保留支持回退）；工作台临时 UI 状态用按剧集作用域的 store 工厂 + Context。
- **保留旧行为**：四条 URL、面板记忆仅整页 reload 恢复、分辨率档位按厂商映射、参考图序号（@名字→@图片N）、导出勾选自动全选语义。
- **修正项（对照文档 §12）**：保存→改写显式 await（保存失败不提交 Agent）；语言弹窗取消不再等价确认；后台刷新不覆盖 dirty 草稿；data:null envelope 语义；API client 不再打印完整请求体；模型选择键改为 `configId:model`（同厂商同模型的不同配置可区分，旧 `provider/model` 与裸模型名偏好可自动迁移）。

## 浏览器与桌面

- 主题 = `<html data-theme>` + CSS 变量（`--hb-*` runtime token）；首帧主题由 `index.html` 内联脚本写入（避免闪烁）；Tailwind 的 dark variant 只读取结果。
- 桌面桥 `window.huobaoDesktop`（8 个方法）经 `shared/desktop/bridge.ts` 类型化访问；非桌面环境能力置空并隐藏入口。
- 四语言词库复用旧 `frontend/app/locales/*.json`（751 条/语言，`{'@'}` 转义已还原，i18next 插值 prefix/suffix 配置为 `{}`）。

## 测试

`npm run test`：cn 合并语义（自定义 token 不被误删/冲突组互斥）、工作台纯函数契约（模型选项归属/参考序号映射/任务状态机/栏宽钳制）、DTO mapper（snake/camel 双形态、JSON 字符串归一）、偏好迁移（旧键种子/损坏回退）。

## 切换发布（P7，待执行）

1. 根 `build:frontend` 改指 `frontend-react`（或直接换 `frontend/` 内容）；
2. `desktop/scripts/prepare-resources.mjs` 校验路径从 `.output/public` 改为 `frontend-react/dist`；
3. `Dockerfile` 前端阶段改为构建 `frontend-react`，`COPY --from=frontend-build /build/frontend-react/dist ./frontend-dist`；
4. 桌面 dev 模式 `FRONTEND_DIST` 指向新 dist；
5. 回退：保留旧前端构建产物，`FRONTEND_DIST` 指回即可（API/偏好双向兼容）。
