/**
 * LanguageSwitchDialog — 统一语言切换确认弹窗：明确区分确认/取消结果，
 * 取消不写任何设置（旧行为为两个按钮等价，本版修正）。
 */
import { createPortal } from 'react-dom'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface LanguageSwitchDialogProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function LanguageSwitchDialog({ open, title, message, onConfirm, onCancel }: LanguageSwitchDialogProps) {
  const { t } = useTranslation()
  return createPortal(
    <AlertDialogPrimitive.Root open={open}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-[100] flex items-center justify-center bg-scrim backdrop-blur-[8px] animate-fade-in" />
        <AlertDialogPrimitive.Content
          className="relative flex max-h-[calc(100vh-96px)] w-full flex-col overflow-hidden rounded-dialog bg-surface shadow-dialog animate-scale-in w-[420px] max-w-[calc(100vw-48px)] items-center px-6 pt-7 pb-5 text-center"
          style={{ zIndex: 101 }}
          aria-describedby={undefined}
        >
          <div className="mx-auto mb-3.5 flex size-[52px] items-center justify-center rounded-full bg-brand-soft text-brand-content">
            <Languages size={20} strokeWidth={1.8} />
          </div>
          <AlertDialogPrimitive.Title className="text-base font-bold tracking-[-0.01em] text-content">
            {title}
          </AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description className="mt-2 max-w-[340px] break-words text-[13px] leading-[1.65] text-content-muted">
            {message}
          </AlertDialogPrimitive.Description>
          <ul className="mt-2.5 mb-0.5 flex list-disc flex-col gap-1 pl-[18px] text-left text-[12.5px] leading-[1.5] text-content-muted marker:text-brand">
            <li>{t('components.langSwitch.effectUi')}</li>
            <li>{t('components.langSwitch.effectAi')}</li>
            <li>{t('components.langSwitch.effectRefresh')}</li>
          </ul>
          <div className="mt-[22px] flex w-full gap-2.5">
            <AlertDialogPrimitive.Cancel type="button" className="inline-flex min-h-9 cursor-pointer flex-1 items-center justify-center gap-1.5 rounded-pill bg-button px-[18px] font-ui text-[13px] font-semibold leading-none whitespace-nowrap text-button-content shadow-item transition-[background,color,box-shadow,transform] duration-150 ease-app hover:bg-button-hover hover:text-button-content hover:shadow-item focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-45" onClick={onCancel}>
              {t('common.cancel')}
            </AlertDialogPrimitive.Cancel>
            <button type="button" className="inline-flex min-h-9 cursor-pointer flex-1 items-center justify-center gap-1.5 rounded-pill bg-brand-gradient px-[18px] font-ui text-[13px] font-semibold leading-none whitespace-nowrap text-on-action transition-[background,color,box-shadow,transform] duration-150 ease-app hover:bg-brand-gradient hover:text-on-action hover:shadow-brand-glow focus-visible:outline-none focus-visible:shadow-focus" onClick={onConfirm}>
              {t('components.langSwitch.confirm')}
            </button>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>,
    document.body,
  )
}
