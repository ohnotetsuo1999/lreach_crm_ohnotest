'use client'

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Move } from 'lucide-react'
import { ReactNode } from 'react'

export interface DraggableItemBase {
  id: string
  folderId?: string | null
  order?: number
}

interface DraggableItemListProps<T extends DraggableItemBase> {
  items: T[]
  currentFolderId: string | null
  onReorderItems: (items: T[]) => void
  onMoveItem: (itemId: string, targetFolderId: string | null) => void
  renderItem: (item: T, index: number, isDragging: boolean, dragHandleProps: any) => ReactNode
  droppableId?: string
  className?: string
  direction?: 'vertical' | 'horizontal'
  showDragHandle?: boolean
}

export function DraggableItemList<T extends DraggableItemBase>({
  items,
  currentFolderId,
  onReorderItems,
  onMoveItem,
  renderItem,
  droppableId = 'item-list',
  className = '',
  direction = 'vertical',
  showDragHandle = true
}: DraggableItemListProps<T>) {
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    // 同じ位置への移動は無視
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    // 異なるフォルダへの移動
    if (destination.droppableId !== source.droppableId) {
      const targetFolderId = destination.droppableId === 'uncategorized' ? null : destination.droppableId
      onMoveItem(draggableId, targetFolderId)
      return
    }

    // 同じフォルダ内での並び替え
    const newItems = Array.from(items)
    const [reorderedItem] = newItems.splice(source.index, 1)
    newItems.splice(destination.index, 0, reorderedItem)

    // order を更新
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index
    }))

    onReorderItems(updatedItems)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={droppableId} type="item" direction={direction}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`${className} ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={snapshot.isDragging ? 'shadow-lg opacity-90' : ''}
                  >
                    {showDragHandle ? (
                      <div className="flex items-center">
                        <div {...provided.dragHandleProps} className="opacity-0 group-hover:opacity-100 p-1 cursor-move transition-opacity">
                          <Move className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          {renderItem(item, index, snapshot.isDragging, null)}
                        </div>
                      </div>
                    ) : (
                      renderItem(item, index, snapshot.isDragging, provided.dragHandleProps)
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

// ヘルパーコンポーネント：テーブル行でのドラッグハンドル
export function TableRowDragHandle({ dragHandleProps }: { dragHandleProps?: any }) {
  return (
    <td className="px-2 w-10">
      <div {...dragHandleProps} className="opacity-0 group-hover:opacity-100 p-1 cursor-move transition-opacity">
        <Move className="w-4 h-4 text-gray-400" />
      </div>
    </td>
  )
}