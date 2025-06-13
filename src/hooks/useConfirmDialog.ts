'use client'

import { useCallback } from 'react'

interface ConfirmOptions {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  entityType?: string
}

export function useConfirmDialog() {
  const confirmDelete = useCallback((
    itemName: string, 
    onConfirm: () => void,
    options: ConfirmOptions = {}
  ) => {
    const {
      entityType = 'アイテム',
      title,
      message
    } = options

    const confirmMessage = message || `${entityType}「${itemName}」を削除しますか？`
    
    if (confirm(confirmMessage)) {
      onConfirm()
    }
  }, [])

  const confirmBulkDelete = useCallback((
    count: number,
    onConfirm: () => void,
    options: ConfirmOptions = {}
  ) => {
    const {
      entityType = 'アイテム',
      message
    } = options

    const confirmMessage = message || `選択した${count}件の${entityType}を削除しますか？`
    
    if (confirm(confirmMessage)) {
      onConfirm()
    }
  }, [])

  const confirmAction = useCallback((
    message: string,
    onConfirm: () => void
  ) => {
    if (confirm(message)) {
      onConfirm()
    }
  }, [])

  const confirmDestructiveAction = useCallback((
    actionName: string,
    targetName: string,
    onConfirm: () => void,
    options: ConfirmOptions = {}
  ) => {
    const {
      entityType = 'アイテム',
      message
    } = options

    const confirmMessage = message || `${entityType}「${targetName}」を${actionName}しますか？この操作は取り消せません。`
    
    if (confirm(confirmMessage)) {
      onConfirm()
    }
  }, [])

  return {
    confirmDelete,
    confirmBulkDelete,
    confirmAction,
    confirmDestructiveAction
  }
}