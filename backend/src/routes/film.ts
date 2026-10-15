/** /api/v1/film — 影片风格流水线路由（独立于 creative 体系）。
 *
 * 风格：GET /styles、GET /styles/:slug
 * 项目：创建走 POST /api/v1/dramas（project_type='film' + film_style）
 * 流水线：POST /projects/:id/run、GET /projects/:id（含轮询推进）、approve、retry
 * 工程：GET /projects/:id/files（工程文件清单）
 */
import { Hono } from 'hono'
import { success, badRequest } from '../utils/response.js'
import { filmStyleGroups, filmStyles, getFilmStyle, filmStyleMarkdown } from '../services/film-styles.js'
import {
  getFilmProject,
  startFilmRun,
  approveFilmStage,
  retryFilmStage,
  pollFilmRun,
  filmWorkdirListing,
} from '../services/film-pipeline/runs.js'

const film = new Hono()

film.get('/styles', (c) => {
  const flat = c.req.query('flat') === '1'
  return success(c, flat ? filmStyles() : filmStyleGroups())
})

film.get('/styles/:slug', (c) => {
  const slug = c.req.param('slug')
  const style = getFilmStyle(slug)
  if (!style) return badRequest(c, `未知影片风格：${slug}`)
  return success(c, { ...style, markdown: filmStyleMarkdown(slug) })
})

film.get('/projects/:id', (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id <= 0) return badRequest(c, '无效项目 id')
  pollFilmRun(id) // waiting 态顺带驱动（渲染完成续跑 / 进度回写）
  return success(c, getFilmProject(id))
})

film.post('/projects/:id/run', (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id <= 0) return badRequest(c, '无效项目 id')
  return success(c, startFilmRun(id))
})

film.post('/projects/:id/approve', (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id <= 0) return badRequest(c, '无效项目 id')
  return success(c, approveFilmStage(id))
})

film.post('/projects/:id/retry', (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id <= 0) return badRequest(c, '无效项目 id')
  return success(c, retryFilmStage(id))
})

film.get('/projects/:id/files', (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id <= 0) return badRequest(c, '无效项目 id')
  getFilmProject(id) // 404 校验
  return success(c, { files: filmWorkdirListing(id) })
})

export default film
