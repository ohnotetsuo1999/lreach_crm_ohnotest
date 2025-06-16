'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Plus, FolderPlus, Edit, Trash2, Package } from 'lucide-react'

export interface ActionMenuItem {
  id: string
  label: string
  icon: React.ElementType
  onClick: () => void
  variant?: 'default' | 'danger'
  divider?: boolean
}

interface ActionMenuProps {
  items: ActionMenuItem[]
  buttonClassName?: string
  menuClassName?: string
  position?: 'left' | 'right'
}

export function ActionMenu({ 
  items, 
  buttonClassName = '',
  menuClassName = '',
  position = 'right'
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleItemClick = (item: ActionMenuItem) => {
    item.onClick()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${buttonClassName}`}
        title="その他の操作"
      >
        <MoreHorizontal className="w-5 h-5 text-gray-600" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute ${position === 'left' ? 'left-0' : 'right-0'} mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 ${menuClassName}`}
        >
          {items.map((item, index) => (
            <div key={item.id}>
              {item.divider && index > 0 && (
                <div className="h-px bg-gray-200 my-1" />
              )}
              <button
                onClick={() => handleItemClick(item)}
                className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                  item.variant === 'danger' ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// 共通のアクションメニューアイテムを生成するヘルパー関数
export function createCommonMenuItems({
  onCreateNew,
  onCreateFolder,
  onEdit,
  onDelete,
  onCreatePack,
  onEditFolder,
  onDeleteFolder,
  selectedItem = null,
  selectedFolder = null,
  entityName = 'アイテム',
  folderName = 'フォルダ'
}: {
  onCreateNew: () => void
  onCreateFolder: () => void
  onEdit?: () => void
  onDelete?: () => void
  onCreatePack?: () => void
  onEditFolder?: () => void
  onDeleteFolder?: () => void
  selectedItem?: any
  selectedFolder?: any
  entityName?: string
  folderName?: string
}): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    {
      id: 'create-new',
      label: `新規${entityName}`,
      icon: Plus,
      onClick: onCreateNew
    },
    {
      id: 'create-folder',
      label: '新規フォルダ',
      icon: FolderPlus,
      onClick: onCreateFolder
    }
  ]

  // テンプレート管理の場合、パック作成を追加
  if (onCreatePack) {
    items.push({
      id: 'create-pack',
      label: '新規パック',
      icon: Package,
      onClick: onCreatePack
    })
  }

  // 選択されているフォルダがある場合はフォルダの編集・削除を追加
  if (selectedFolder && onEditFolder) {
    items.push({
      id: 'edit-folder',
      label: `${folderName}を編集`,
      icon: Edit,
      onClick: onEditFolder,
      divider: true
    })
  }

  if (selectedFolder && onDeleteFolder) {
    items.push({
      id: 'delete-folder',
      label: `${folderName}を削除`,
      icon: Trash2,
      onClick: onDeleteFolder,
      variant: 'danger'
    })
  }

  // 選択されているアイテムがある場合は編集・削除を追加
  if (selectedItem && onEdit) {
    items.push({
      id: 'edit',
      label: '編集',
      icon: Edit,
      onClick: onEdit,
      divider: true
    })
  }

  if (selectedItem && onDelete) {
    items.push({
      id: 'delete',
      label: '削除',
      icon: Trash2,
      onClick: onDelete,
      variant: 'danger',
      divider: !onEdit
    })
  }

  return items
}