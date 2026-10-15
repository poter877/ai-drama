/** 图片查看器与视频预览弹窗（工作台共用）。样式已全部迁移 Tailwind utilities/variants */
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { buttonVariants } from '@/shared/ui/button'
import { cn } from '@/shared/lib/cn'

interface ImageViewerProps {
  open: boolean
  src: string
  title: string
  onClose: () => void
}

// 原 .overlay（全局）+ .image-viewer-overlay 覆盖（z/padding）
const viewerOverlayClass =
  'fixed inset-0 z-[118] flex items-center justify-center bg-scrim backdrop-blur-[8px] animate-fade-in p-7 max-1080:p-4'
const dialogClass =
  'relative flex max-h-[calc(100vh-96px)] w-full flex-col overflow-hidden rounded-dialog bg-surface shadow-dialog animate-scale-in'
const imageViewerDialogClass =
  'w-[min(1100px,calc(100vw-56px))] max-h-[calc(100vh-56px)] bg-header backdrop-blur-[20px] backdrop-saturate-[1.8] max-1080:w-[calc(100vw-32px)] max-1080:max-h-[calc(100vh-32px)]'
const viewerHeadClass = 'flex items-center gap-3 border-b border-outline px-[18px] py-4'
const viewerTitleClass = 'text-[14px] font-bold font-display text-content-secondary'

export function ImageViewer({ open, src, title, onClose }: ImageViewerProps) {
  const { t } = useTranslation()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !src) return null
  return (
    <div className={viewerOverlayClass} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={cn(dialogClass, imageViewerDialogClass)}>
        <div className={viewerHeadClass}>
          <div className={viewerTitleClass}>{title || t('episode.viewer.imagePreview')}</div>
          <button type="button" className={buttonVariants({ variant: 'ghost', size: 'icon' })} onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex min-h-0 items-center justify-center overflow-auto p-5">
          <img src={src} alt={title || t('episode.viewer.imagePreview')} className="block max-h-[calc(100vh-140px)] max-w-full rounded-[18px] bg-surface-muted shadow-dialog" />
        </div>
      </div>
    </div>
  )
}

interface VideoViewerProps {
  open: boolean
  title: string
  meta?: string
  src: string
  downloadHref: string
  downloadLabel?: string
  onClose: () => void
}

export function VideoViewer({ open, title, meta, src, downloadHref, downloadLabel, onClose }: VideoViewerProps) {
  const { t } = useTranslation()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !src) return null
  return (
    <div className={viewerOverlayClass} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={cn(dialogClass, imageViewerDialogClass, 'w-[min(1080px,calc(100vw-56px))]')}>
        <div className={viewerHeadClass}>
          <div className={viewerTitleClass}>{title}</div>
          {meta && <span className="text-content-subtle" style={{ fontSize: 11 }}>{meta}</span>}
          <a href={downloadHref} download className={buttonVariants({ size: 'sm' })}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {downloadLabel || t('common.download')}
          </a>
          <button type="button" className={buttonVariants({ variant: 'ghost', size: 'icon' })} onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex min-h-0 items-center justify-center p-[18px]">
          <video key={src} src={src} controls autoPlay playsInline className="block max-h-[calc(100vh-220px)] w-full rounded-control bg-black" />
        </div>
      </div>
    </div>
  )
}
