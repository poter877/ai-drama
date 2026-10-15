/** 新建项目弹窗：标题 + 视觉风格 + 画幅（保留旧结构规则：创建只要标题与风格） */
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toastError } from '@/shared/lib/errors'
import { dramaApi } from '@/entities/drama/api'
import { qk } from '@/shared/api/query-keys'
import { Modal } from '@/shared/ui/Modal'
import { BaseSelect } from '@/shared/ui/BaseSelect'
import type { SelectOption } from '@/shared/ui/BaseSelect'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import type { StylePreset } from '@/entities/settings/api'

interface CreateProjectDialogProps {
  open: boolean
  onClose: () => void
  stylePresets: StylePreset[]
  aspectRatioOptions: SelectOption[]
  onCreated: (dramaId: number) => void
}

const fieldClass = 'flex flex-col gap-1.5'
const fieldLabelClass = 'text-xs font-semibold text-content-secondary'

export function CreateProjectDialog({ open, onClose, stylePresets, aspectRatioOptions, onCreated }: CreateProjectDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [style, setStyle] = useState('')
  const [aspectRatio, setAspectRatio] = useState('16:9')

  const styleSelectOptions = stylePresets.map((p) => ({ label: p.name, value: p.value }))
  const selectedStyleDesc = stylePresets.find((p) => p.value === style)?.description || ''

  // 打开时重置表单；风格预设就绪且未选时补默认（与旧行为一致）
  useEffect(() => {
    if (!open) return
    setTitle('')
    setStyle(stylePresets[0]?.value ?? '')
    setAspectRatio('16:9')
  }, [open, stylePresets])

  const createMutation = useMutation({
    mutationFn: () =>
      dramaApi.create({
        title: title.trim(),
        style: style || undefined,
        aspect_ratio: aspectRatio,
      }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: qk.dramas() })
      onClose()
      onCreated(Number((data as { id?: number })?.id))
    },
    onError: (err) => toastError(err),
  })

  return (
    <Modal
      open={open}
      onOpenChange={(v) => !v && onClose()}
      width={460}
      title={
        <span className="flex flex-col gap-0.5">
          <span>{t('index.createDialog.title')}</span>
          <span className="text-[12.5px] font-normal text-content-subtle">{t('index.createDialog.desc')}</span>
        </span>
      }
      showClose={false}
      icon={
        <div className="flex size-10 shrink-0 items-center justify-center rounded-control bg-brand-soft text-brand">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </div>
      }
      footer={
        <>
          <Button onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" form="create-project-form" variant="primary" loading={createMutation.isPending}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('index.createDialog.submit')}
          </Button>
        </>
      }
    >
      <form
        id="create-project-form"
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (!title.trim()) return
          createMutation.mutate()
        }}
      >
        <label className={fieldClass}>
          <span className={fieldLabelClass}>
            {t('index.createDialog.name')} <span className="text-danger">*</span>
          </span>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('index.createDialog.namePlaceholder')}
            required
            autoFocus
          />
        </label>
        <label className={fieldClass}>
          <span className={fieldLabelClass}>{t('index.createDialog.style')}</span>
          <BaseSelect
            value={style}
            onChange={setStyle}
            options={styleSelectOptions}
            placeholder={t('index.createDialog.stylePlaceholder')}
            searchable
          />
          {selectedStyleDesc && <span className="text-micro leading-[1.5] text-content-subtle">{selectedStyleDesc}</span>}
        </label>
        <label className={fieldClass}>
          <span className={fieldLabelClass}>{t('index.createDialog.aspectRatio')}</span>
          <BaseSelect
            value={aspectRatio}
            onChange={setAspectRatio}
            options={aspectRatioOptions}
            placeholder={t('index.createDialog.aspectRatioPlaceholder')}
          />
          <span className="text-micro leading-[1.5] text-content-subtle">{t('index.createDialog.aspectRatioHint')}</span>
        </label>
      </form>
    </Modal>
  )
}
