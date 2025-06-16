'use client'

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Move } from 'lucide-react'
import { ReactNode } from 'react'

export interface DraggableTableItemBase {
  id: string
  folderId?: string | null
  order?: number
}

interface DraggableTableBodyProps<T extends DraggableTableItemBase> {
  items: T[]
  currentFolderId: string | null | undefined
  onReorderItems: (items: T[]) => void
  onMoveItem: (itemId: string, targetFolderId: string | null) => void
  renderRow: (item: T, index: number, isDragging: boolean, dragHandleProps: any) => ReactNode
  droppableId?: string
  showDragHandle?: boolean
}

export function DraggableTableBody<T extends DraggableTableItemBase>({
  items,
  currentFolderId,
  onReorderItems,
  onMoveItem,
  renderRow,
  droppableId = 'table-body',
  showDragHandle = true
}: DraggableTableBodyProps<T>) {
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
      <Droppable droppableId={droppableId} type="item">
        {(provided, snapshot) => (
          <tbody
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`bg-white divide-y divide-gray-200 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <tr
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`hover:bg-gray-50 group ${snapshot.isDragging ? 'shadow-lg opacity-90 bg-white' : ''}`}
                  >
                    {showDragHandle && (
                      <td className="px-2 w-10">
                        <div {...provided.dragHandleProps} className="opacity-0 group-hover:opacity-100 p-1 cursor-move transition-opacity">
                          <Move className="w-4 h-4 text-gray-400" />
                        </div>
                      </td>
                    )}
                    {renderRow(item, index, snapshot.isDragging, showDragHandle ? null : provided.dragHandleProps)}
                  </tr>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </tbody>
        )}
      </Droppable>
    </DragDropContext>
  )
}