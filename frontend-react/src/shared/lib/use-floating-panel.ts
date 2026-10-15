/**
 * useFloatingPanel — 全站统一的浮层定位与生命周期（旧 usePopover 的 React 版）
 *
 * 行为规范（所有下拉/菜单强制一致）：
 * - 定位：fixed + getBoundingClientRect，水平按 placement 对齐并钳制视口，
 *   下方空间不足且上方更大时翻转到上方
 * - 滚动（面板自身滚动除外）/ resize → 关闭
 * - Escape → 关闭并把焦点还回触发器
 * - pointerdown outside → 关闭（点击继续生效，不用 backdrop 元素）
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'

export interface FloatingPanelOptions {
  placement?: 'bottom-start' | 'bottom-end' | 'bottom' | 'top-start' | 'top-end' | 'top'
  offset?: number
  matchWidth?: boolean
  minWidth?: number
  maxHeight?: number
  viewportMargin?: number
}

export interface FloatingPanel {
  isOpen: boolean
  anchorRef: RefObject<HTMLElement | null>
  panelRef: RefObject<HTMLDivElement | null>
  panelStyle: CSSProperties
  placement: 'bottom' | 'top'
  open: () => void
  close: () => void
  toggle: () => void
}

export function useFloatingPanel(opts: FloatingPanelOptions = {}): FloatingPanel {
  const [isOpen, setIsOpen] = useState(false)
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({})
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom')
  const anchorRef = useRef<HTMLElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  const offset = opts.offset ?? 6
  const margin = opts.viewportMargin ?? 12
  const minWidth = opts.minWidth ?? 160
  const maxHeight = opts.maxHeight ?? 320

  const position = useCallback(() => {
    const rect = anchorRef.current?.getBoundingClientRect()
    if (!rect) return
    const width = opts.matchWidth ? rect.width : Math.max(minWidth, rect.width)
    const alignEnd = opts.placement?.endsWith('end')
    const alignCenter = opts.placement === 'bottom' || opts.placement === 'top'
    const preferTop = opts.placement?.startsWith('top')

    let left = rect.left
    if (alignEnd) left = rect.right - width
    else if (alignCenter) left = rect.left + rect.width / 2 - width / 2
    left = Math.max(margin, Math.min(left, window.innerWidth - width - margin))

    let finalPlacement: 'bottom' | 'top'
    let top: number
    if (preferTop) {
      // 期望向上：上方空间不足且下方更大时回退到向下
      const above = rect.top - margin
      const below = window.innerHeight - rect.bottom - margin
      const h = panelRef.current?.offsetHeight ?? maxHeight
      if (above < Math.min(h, 240) && below > above) {
        finalPlacement = 'bottom'
        top = rect.bottom + offset
      } else {
        finalPlacement = 'top'
        top = Math.max(margin, rect.top - Math.min(h, maxHeight) - offset)
      }
    } else {
      finalPlacement = 'bottom'
      top = rect.bottom + offset
      // 面板渲染后测真实高度，下方不够且上方更大则翻转
      requestAnimationFrame(() => {
        const h = panelRef.current?.offsetHeight ?? 0
        const below = window.innerHeight - rect.bottom - margin
        const above = rect.top - margin
        if (below < Math.min(h, 240) && above > below) {
          setPlacement('top')
          setPanelStyle((prev) => ({
            ...prev,
            top: `${Math.max(margin, rect.top - h - offset)}px`,
          }))
        }
      })
    }

    setPlacement(finalPlacement)
    setPanelStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      maxHeight: `${maxHeight}px`,
    })

    if (preferTop) {
      // 向上打开时用真实高度精确对齐底边
      requestAnimationFrame(() => {
        const h = panelRef.current?.offsetHeight ?? 0
        if (finalPlacement === 'top') {
          setPanelStyle((prev) => ({
            ...prev,
            top: `${Math.max(margin, rect.top - h - offset)}px`,
          }))
        }
      })
    }
  }, [opts.matchWidth, opts.placement, offset, margin, minWidth, maxHeight])

  const close = useCallback(() => setIsOpen(false), [])
  const open = useCallback(() => setIsOpen(true), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  useEffect(() => {
    if (!isOpen) return
    position()

    const onScroll = (e: Event) => {
      if (panelRef.current && e.target instanceof Node && panelRef.current.contains(e.target)) return
      close()
    }
    const onResize = () => close()
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      close()
      anchorRef.current?.focus?.()
    }
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (anchorRef.current?.contains(target) || panelRef.current?.contains(target)) return
      close()
    }

    document.addEventListener('scroll', onScroll, true)
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeydown)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('scroll', onScroll, true)
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeydown)
      window.removeEventListener('resize', onResize)
    }
  }, [isOpen, position, close])

  return { isOpen, anchorRef, panelRef, panelStyle, placement, open, close, toggle }
}
