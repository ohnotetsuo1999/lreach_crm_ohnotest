'use client'

import { useState, useMemo } from 'react'

export interface FolderItem {
  id: string
  name: string
  parentId?: string | null
}

export interface FolderHierarchy<T extends FolderItem> {
  folder: T
  children: FolderHierarchy<T>[]
  itemCount: number
}

interface UseFolderProps<T extends FolderItem> {
  folders: T[]
  items?: any[]
  getItemFolderId?: (item: any) => string | null | undefined
}

export function useFolder<T extends FolderItem>({
  folders,
  items = [],
  getItemFolderId
}: UseFolderProps<T>) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  const toggleExpand = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (expandedFolders.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const buildFolderHierarchy = useMemo((): FolderHierarchy<T>[] => {
    const folderMap = new Map<string, T>()
    folders.forEach(folder => folderMap.set(folder.id, folder))

    const getItemCount = (folderId: string): number => {
      if (!getItemFolderId) return 0
      return items.filter(item => getItemFolderId(item) === folderId).length
    }

    const buildChildren = (parentId: string | null | undefined): FolderHierarchy<T>[] => {
      const children = folders.filter(folder => 
        (parentId === null && !folder.parentId) || 
        (parentId === undefined && !folder.parentId) ||
        folder.parentId === parentId
      )

      return children.map(folder => ({
        folder,
        children: buildChildren(folder.id),
        itemCount: getItemCount(folder.id)
      }))
    }

    return buildChildren(null)
  }, [folders, items, getItemFolderId])

  const uncategorizedCount = useMemo(() => {
    if (!getItemFolderId) return 0
    return items.filter(item => !getItemFolderId(item)).length
  }, [items, getItemFolderId])

  const getAllFolderIds = (): string[] => {
    return folders.map(folder => folder.id)
  }

  const getFolderPath = (folderId: string): T[] => {
    const path: T[] = []
    let currentFolder = folders.find(f => f.id === folderId)
    
    while (currentFolder) {
      path.unshift(currentFolder)
      currentFolder = currentFolder.parentId 
        ? folders.find(f => f.id === currentFolder!.parentId) 
        : undefined
    }
    
    return path
  }

  const expandToFolder = (folderId: string) => {
    const path = getFolderPath(folderId)
    const newExpanded = new Set(expandedFolders)
    
    path.forEach(folder => {
      if (folder.parentId) {
        newExpanded.add(folder.parentId)
      }
    })
    
    setExpandedFolders(newExpanded)
  }

  const collapseAll = () => {
    setExpandedFolders(new Set())
  }

  const expandAll = () => {
    setExpandedFolders(new Set(getAllFolderIds()))
  }

  return {
    // State
    expandedFolders,
    selectedFolderId,
    
    // Computed
    folderHierarchy: buildFolderHierarchy,
    uncategorizedCount,
    
    // Actions
    setSelectedFolderId,
    toggleExpand,
    expandToFolder,
    collapseAll,
    expandAll,
    
    // Utilities
    getFolderPath,
    getAllFolderIds
  }
}