/**
 * AppMenu — 全站统一的下拉菜单面板（Portal + 统一定位/动效/层级）。
 * 触发器由调用方通过 trigger 渲染属性自定义（保留各自形态），只统一菜单层。
 * 菜单项请使用 AppMenuItem。
 */
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { useFloatingPanel } from '@/shared/lib/use-floating-panel'

interface AppMenuProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: 'bottom-start' | 'bottom-end' | 'bottom' | 'top-start' | 'top-end' | 'top'
  matchWidth?: boolean
  minWidth?: number
  maxHeight?: number
  /** 锚点占满整行（BaseSelect 用） */
  block?: boolean
  /** 触发器渲染：({ open }) => ReactNode */
  trigger: (state: { open: boolean }) => ReactNode
  children: ReactNode
}

export function AppMenu({
  open: controlledOpen,
  onOpenChange,
  placement = 'bottom-start',
  matchWidth = false,
  minWidth = 160,
  maxHeight = 320,
  block = false,
  trigger,
  children,
}: AppMenuProps) {
  const panel = useFloatingPanel({ placement, matchWidth, minWidth, maxHeight })
  const isOpen = controlledOpen ?? panel.isOpen

  function setOpen(next: boolean) {
    if (controlledOpen === undefined) {
      if (next) panel.open()
      else panel.close()
    }
    onOpenChange?.(next)
  }

  return (
    <>
      <span
        ref={panel.anchorRef}
        className={`inline-flex min-w-0${block ? ' flex w-full' : ''}`}
        onClick={() => setOpen(!isOpen)}
      >
        {trigger({ open: isOpen })}
      </span>
      {createPortal(
        isOpen ? (
          <div
            ref={panel.panelRef}
            className={`z-[var(--hb-z-menu)] flex flex-col overflow-y-auto rounded-panel border border-outline bg-surface p-[5px] shadow-raised outline-none ${
              panel.placement === 'top' ? 'animate-menu-in-top' : 'animate-menu-in'
            }`}
            style={panel.panelStyle}
            data-placement={panel.placement}
            role="menu"
          >
            {children}
          </div>
        ) : null,
        document.body,
      )}
    </>
  )
}
