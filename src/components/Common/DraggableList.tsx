'use client'

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Move } from 'lucide-react'
import { ReactNode } from 'react'

export interface DraggableItem {
  id: string
  order?: number
}

interface DraggableListProps<T extends DraggableItem> {
  items: T[]
  onReorder: (items: T[]) => void
  renderItem: (item: T, index: number, dragHandleProps: any) => ReactNode
  droppableId?: string
  className?: string
  direction?: 'vertical' | 'horizontal'
}

export function DraggableList<T extends DraggableItem>({
  items,
  onReorder,
  renderItem,
  droppableId = 'list',
  className = '',
  direction = 'vertical'
}: DraggableListProps<T>) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const startIndex = result.source.index
    const endIndex = result.destination.index

    if (startIndex === endIndex) return

    const newItems = Array.from(items)
    const [reorderedItem] = newItems.splice(startIndex, 1)
    newItems.splice(endIndex, 0, reorderedItem)

    // Update order property
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index
    }))

    onReorder(updatedItems)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={droppableId} direction={direction}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={className}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={snapshot.isDragging ? 'shadow-lg' : ''}
                  >
                    {renderItem(item, index, provided.dragHandleProps)}
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

// ドラッグハンドルコンポーネント
export function DragHandle({ dragHandleProps, className = '' }: { dragHandleProps?: any; className?: string }) {
  return (
    <div {...dragHandleProps} className={`opacity-0 group-hover:opacity-100 p-1 cursor-move transition-opacity ${className}`}>
      <Move className="w-4 h-4 text-gray-400" />
    </div>
  )
}