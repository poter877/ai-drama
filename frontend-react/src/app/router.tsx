/**
 * 路由表 — 与旧前端完全一致的四条 URL：
 * / 、/settings、/drama/:id、/drama/:id/episode/:episodeNumber。
 * episode 使用 studio 布局（全屏）；其余使用 default 布局（顶栏壳）。
 * 路由组件 lazy 分包；无效参数呈现明确错误态（各 Route 内部处理）。
 */
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import { DefaultLayout } from './layouts/DefaultLayout'
import { StudioLayout } from './layouts/StudioLayout'
import { RouteError } from './RouteError'

const ProjectsRoute = lazy(() => import('@/routes/projects/ProjectsRoute'))
const SettingsRoute = lazy(() => import('@/routes/settings/SettingsRoute'))
const DramaDetailRoute = lazy(() => import('@/routes/drama/DramaDetailRoute'))
const EpisodeWorkbenchRoute = lazy(() => import('@/routes/episode/EpisodeWorkbenchRoute'))

export const router = createBrowserRouter([
  {
    element: <DefaultLayout />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: <ProjectsRoute /> },
      { path: '/settings', element: <SettingsRoute /> },
      { path: '/drama/:id', element: <DramaDetailRoute /> },
    ],
  },
  {
    path: '/drama/:id/episode/:episodeNumber',
    element: <StudioLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <EpisodeWorkbenchRoute /> }],
  },
  { path: '*', element: <RouteError /> },
])
