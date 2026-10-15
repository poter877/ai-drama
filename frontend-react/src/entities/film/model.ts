/** 影片风格（film pipeline）领域层：风格图鉴、项目状态与流水线操作 */
import { api } from '@/shared/api/client'
import { queryOptions } from '@tanstack/react-query'

export interface FilmStyleMeta {
  slug: string
  num: string
  en: string
  cn: string
  category_en: string
  category_cn: string
  film: string
  line: string
  line_cn: string
  uses: string[]
  dur: number
  renderProfile: '2d' | 'shader' | '3d'
}

export interface FilmStyleGroup {
  key: string
  cn: string
  en: string
  styles: FilmStyleMeta[]
}

export interface FilmStyleDetail extends FilmStyleMeta {
  markdown: string
}

export const filmStylesApi = {
  groups: (signal?: AbortSignal) => api.get<FilmStyleGroup[]>('/film/styles', { signal }),
  flat: (signal?: AbortSignal) => api.get<FilmStyleMeta[]>('/film/styles?flat=1', { signal }),
  detail: (slug: string, signal?: AbortSignal) => api.get<FilmStyleDetail>(`/film/styles/${slug}`, { signal }),
}

export type FilmStageStatus = 'pending' | 'running' | 'review' | 'waiting' | 'completed' | 'failed'
export type FilmRunStatus = 'ready' | 'running' | 'review' | 'waiting' | 'paused' | 'failed' | 'completed' | 'cancelled'

export interface FilmArtifact {
  summary: string
  content: string
  checks: string[]
  data?: Record<string, unknown>
}

export interface FilmStageState {
  id: string
  status: FilmStageStatus
  attempt: number
  artifact: FilmArtifact | null
  error: string | null
  approvedAt: string | null
  completedAt: string | null
}

export interface FilmRenderJob {
  id: number
  projectId: number
  runId: number | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  phase: string | null
  videoUrl: string | null
  posterUrl: string | null
  srtUrl: string | null
  errorMsg: string | null
}

export interface FilmProject {
  projectId: number
  title: string
  style: FilmStyleMeta
  topic: string
  language: string
  durationSec: number
  hasVoice: boolean
  aspectRatio: string
  revision: number
  run: {
    id: number
    projectId: number
    status: FilmRunStatus
    cursor: number
    stages: FilmStageState[]
    error: string | null
  } | null
  render: FilmRenderJob | null
}

export const filmApi = {
  project: (id: number, signal?: AbortSignal) => api.get<FilmProject>(`/film/projects/${id}`, { signal }),
  start: (id: number) => api.post<FilmProject>(`/film/projects/${id}/run`),
  approve: (id: number) => api.post<FilmProject>(`/film/projects/${id}/approve`),
  retry: (id: number) => api.post<FilmProject>(`/film/projects/${id}/retry`),
  files: (id: number, signal?: AbortSignal) => api.get<{ files: string[] }>(`/film/projects/${id}/files`, { signal }),
}

export const filmQueries = {
  groups: () =>
    queryOptions({
      queryKey: ['film', 'style-groups'],
      queryFn: ({ signal }) => filmStylesApi.groups(signal),
      staleTime: 10 * 60_000,
    }),
  flat: () =>
    queryOptions({
      queryKey: ['film', 'styles'],
      queryFn: ({ signal }) => filmStylesApi.flat(signal),
      staleTime: 10 * 60_000,
    }),
  detail: (slug: string) =>
    queryOptions({
      queryKey: ['film', 'style', slug],
      queryFn: ({ signal }) => filmStylesApi.detail(slug, signal),
      staleTime: 10 * 60_000,
    }),
  project: (id: number) =>
    queryOptions({
      queryKey: ['film', 'project', id],
      queryFn: ({ signal }) => filmApi.project(id, signal),
      enabled: Number.isInteger(id) && id > 0,
      // waiting（渲染中）自动轮询；review/running 等待操作不轮询
      refetchInterval: (query) => {
        const run = (query.state.data as FilmProject | undefined)?.run
        return run?.status === 'waiting' ? 3000 : false
      },
    }),
}
