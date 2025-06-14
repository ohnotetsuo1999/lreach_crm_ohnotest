'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  GitBranch, 
  Clock, 
  MessageSquare, 
  Target, 
  Settings,
  Trash2,
  ArrowDown,
  ArrowRight,
  Timer,
  Tag as TagIcon,
  Users,
  Zap,
  Edit,
  Copy
} from 'lucide-react'
import { Template, Tag, Status, Segment } from '@/types'
import { MessageFlowNode, MessageFlowEdge, FlowCondition, FlowTiming } from '@/types/messageFlow'

interface MessageFlowBuilderProps {
  templates: Template[]
  tags: Tag[]
  statuses: Status[]
  segments: Segment[]
  onFlowChange: (nodes: MessageFlowNode[], edges: MessageFlowEdge[]) => void
}

export function MessageFlowBuilder({
  templates,
  tags,
  statuses,
  segments,
  onFlowChange
}: MessageFlowBuilderProps) {
  const [nodes, setNodes] = useState<MessageFlowNode[]>([])
  const [edges, setEdges] = useState<MessageFlowEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [showNodeEditor, setShowNodeEditor] = useState(false)
  const [editingNode, setEditingNode] = useState<MessageFlowNode | null>(null)

  useEffect(() => {
    onFlowChange(nodes, edges)
  }, [nodes, edges, onFlowChange])

  const addNode = (type: MessageFlowNode['type']) => {
    const newNode: MessageFlowNode = {
      id: `node_${Date.now()}`,
      type,
      position: { x: 100, y: nodes.length * 150 + 100 },
      data: {}
    }

    setNodes([...nodes, newNode])
    setEditingNode(newNode)
    setShowNodeEditor(true)
  }

  const updateNode = (nodeId: string, updates: Partial<MessageFlowNode>) => {
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ))
  }

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId))
    setEdges(edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId))
  }

  const connectNodes = (sourceId: string, targetId: string, type: MessageFlowEdge['type'] = 'default') => {
    const newEdge: MessageFlowEdge = {
      id: `edge_${Date.now()}`,
      source: sourceId,
      target: targetId,
      type
    }
    setEdges([...edges, newEdge])
  }

  const renderNodeEditor = () => {
    if (!editingNode) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingNode.type === 'template' && 'テンプレート設定'}
                {editingNode.type === 'condition' && '条件分岐設定'}
                {editingNode.type === 'delay' && '遅延設定'}
                {editingNode.type === 'action' && 'アクション設定'}
              </h3>
              <button
                onClick={() => setShowNodeEditor(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6">
            {editingNode.type === 'template' && renderTemplateEditor()}
            {editingNode.type === 'condition' && renderConditionEditor()}
            {editingNode.type === 'delay' && renderDelayEditor()}
            {editingNode.type === 'action' && renderActionEditor()}
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={() => setShowNodeEditor(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              キャンセル
            </button>
            <button
              onClick={() => {
                if (editingNode) {
                  const existingIndex = nodes.findIndex(n => n.id === editingNode.id)
                  if (existingIndex >= 0) {
                    updateNode(editingNode.id, editingNode)
                  } else {
                    setNodes([...nodes, editingNode])
                  }
                }
                setShowNodeEditor(false)
                setEditingNode(null)
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderTemplateEditor = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          テンプレートを選択
        </label>
        <select
          value={editingNode?.data.templateId || ''}
          onChange={(e) => {
            const template = templates.find(t => t.id === e.target.value)
            if (editingNode && template) {
              setEditingNode({
                ...editingNode,
                data: {
                  ...editingNode.data,
                  templateId: template.id,
                  template: {
                    id: template.id,
                    name: template.name,
                    content: template.content,
                    type: template.type
                  }
                }
              })
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">テンプレートを選択してください</option>
          {templates.map(template => (
            <option key={template.id} value={template.id}>
              {template.name} ({template.type})
            </option>
          ))}
        </select>
      </div>

      {editingNode?.data.template && (
        <div className="p-3 bg-gray-50 rounded-md">
          <h4 className="font-medium text-gray-900 mb-2">{editingNode.data.template.name}</h4>
          <p className="text-sm text-gray-600">{editingNode.data.template.content}</p>
        </div>
      )}
    </div>
  )

  const renderConditionEditor = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          条件タイプ
        </label>
        <select
          value={editingNode?.data.condition?.type || ''}
          onChange={(e) => {
            if (editingNode) {
              setEditingNode({
                ...editingNode,
                data: {
                  ...editingNode.data,
                  condition: {
                    ...editingNode.data.condition,
                    type: e.target.value as any,
                    operator: 'has',
                    value: ''
                  }
                }
              })
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">条件タイプを選択</option>
          <option value="tag">タグ条件</option>
          <option value="action">ユーザーアクション</option>
          <option value="time">時間条件</option>
          <option value="segment">セグメント条件</option>
        </select>
      </div>

      {editingNode?.data.condition?.type === 'tag' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              演算子
            </label>
            <select
              value={editingNode.data.condition.operator}
              onChange={(e) => {
                if (editingNode) {
                  setEditingNode({
                    ...editingNode,
                    data: {
                      ...editingNode.data,
                      condition: {
                        ...editingNode.data.condition!,
                        operator: e.target.value as any
                      }
                    }
                  })
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="has">持っている</option>
              <option value="not_has">持っていない</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タグ
            </label>
            <select
              value={editingNode.data.condition.tagId || ''}
              onChange={(e) => {
                if (editingNode) {
                  setEditingNode({
                    ...editingNode,
                    data: {
                      ...editingNode.data,
                      condition: {
                        ...editingNode.data.condition!,
                        tagId: e.target.value
                      }
                    }
                  })
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">タグを選択</option>
              {tags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {editingNode?.data.condition?.type === 'time' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              時間
            </label>
            <input
              type="number"
              value={editingNode.data.condition.timeValue || ''}
              onChange={(e) => {
                if (editingNode) {
                  setEditingNode({
                    ...editingNode,
                    data: {
                      ...editingNode.data,
                      condition: {
                        ...editingNode.data.condition!,
                        timeValue: parseInt(e.target.value)
                      }
                    }
                  })
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="数値"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              単位
            </label>
            <select
              value={editingNode.data.condition.timeUnit || 'hours'}
              onChange={(e) => {
                if (editingNode) {
                  setEditingNode({
                    ...editingNode,
                    data: {
                      ...editingNode.data,
                      condition: {
                        ...editingNode.data.condition!,
                        timeUnit: e.target.value as any
                      }
                    }
                  })
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="minutes">分</option>
              <option value="hours">時間</option>
              <option value="days">日</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )

  const renderDelayEditor = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            遅延時間
          </label>
          <input
            type="number"
            value={editingNode?.data.delay?.value || ''}
            onChange={(e) => {
              if (editingNode) {
                setEditingNode({
                  ...editingNode,
                  data: {
                    ...editingNode.data,
                    delay: {
                      ...editingNode.data.delay,
                      value: parseInt(e.target.value),
                      unit: editingNode.data.delay?.unit || 'hours'
                    }
                  }
                })
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="数値"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            単位
          </label>
          <select
            value={editingNode?.data.delay?.unit || 'hours'}
            onChange={(e) => {
              if (editingNode) {
                setEditingNode({
                  ...editingNode,
                  data: {
                    ...editingNode.data,
                    delay: {
                      ...editingNode.data.delay,
                      value: editingNode.data.delay?.value || 1,
                      unit: e.target.value as any
                    }
                  }
                })
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="minutes">分後</option>
            <option value="hours">時間後</option>
            <option value="days">日後</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          実行条件
        </label>
        <select
          value={editingNode?.data.delay?.condition || 'always'}
          onChange={(e) => {
            if (editingNode) {
              setEditingNode({
                ...editingNode,
                data: {
                  ...editingNode.data,
                  delay: {
                    ...editingNode.data.delay,
                    value: editingNode.data.delay?.value || 1,
                    unit: editingNode.data.delay?.unit || 'hours',
                    condition: e.target.value as any
                  }
                }
              })
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="always">常に実行</option>
          <option value="business_hours">営業時間内のみ</option>
          <option value="weekdays">平日のみ</option>
        </select>
      </div>
    </div>
  )

  const renderActionEditor = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          アクションタイプ
        </label>
        <select
          value={editingNode?.data.action?.type || ''}
          onChange={(e) => {
            if (editingNode) {
              setEditingNode({
                ...editingNode,
                data: {
                  ...editingNode.data,
                  action: {
                    type: e.target.value as any
                  }
                }
              })
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">アクションを選択</option>
          <option value="add_tag">タグを追加</option>
          <option value="remove_tag">タグを削除</option>
          <option value="change_status">ステータス変更</option>
          <option value="send_notification">通知送信</option>
        </select>
      </div>

      {(editingNode?.data.action?.type === 'add_tag' || editingNode?.data.action?.type === 'remove_tag') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            対象タグ
          </label>
          <select
            value={editingNode.data.action.tagId || ''}
            onChange={(e) => {
              if (editingNode) {
                setEditingNode({
                  ...editingNode,
                  data: {
                    ...editingNode.data,
                    action: {
                      ...editingNode.data.action!,
                      tagId: e.target.value
                    }
                  }
                })
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">タグを選択</option>
            {tags.map(tag => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )

  const getNodeIcon = (type: MessageFlowNode['type']) => {
    switch (type) {
      case 'template': return MessageSquare
      case 'condition': return GitBranch
      case 'delay': return Clock
      case 'action': return Zap
      default: return MessageSquare
    }
  }

  const getNodeColor = (type: MessageFlowNode['type']) => {
    switch (type) {
      case 'template': return 'bg-blue-500'
      case 'condition': return 'bg-yellow-500'
      case 'delay': return 'bg-purple-500'
      case 'action': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* ツールバー */}
      <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
        <button
          onClick={() => addNode('template')}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <MessageSquare className="w-4 h-4" />
          テンプレート追加
        </button>
        <button
          onClick={() => addNode('condition')}
          className="flex items-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
        >
          <GitBranch className="w-4 h-4" />
          条件分岐
        </button>
        <button
          onClick={() => addNode('delay')}
          className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
        >
          <Clock className="w-4 h-4" />
          遅延設定
        </button>
        <button
          onClick={() => addNode('action')}
          className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          <Zap className="w-4 h-4" />
          アクション
        </button>
      </div>

      {/* フローエリア */}
      <div className="min-h-96 bg-white border border-gray-200 rounded-lg p-6">
        {nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">テンプレートが追加されていません</p>
            <p className="text-sm">シナリオにメッセージテンプレートを追加してください</p>
            <button
              onClick={() => addNode('template')}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              最初のテンプレートを追加
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {nodes.map((node, index) => {
              const Icon = getNodeIcon(node.type)
              const colorClass = getNodeColor(node.type)
              
              return (
                <div key={node.id} className="flex items-center gap-4">
                  <div className={`flex items-center gap-3 p-4 rounded-lg border ${selectedNode === node.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                    <div className={`p-2 ${colorClass} text-white rounded`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {node.type === 'template' && (node.data.template?.name || 'テンプレート未選択')}
                        {node.type === 'condition' && '条件分岐'}
                        {node.type === 'delay' && `${node.data.delay?.value || 0}${node.data.delay?.unit === 'minutes' ? '分' : node.data.delay?.unit === 'hours' ? '時間' : '日'}後`}
                        {node.type === 'action' && 'アクション実行'}
                      </div>
                      {node.data.template && (
                        <div className="text-sm text-gray-600 mt-1">
                          {node.data.template.content.substring(0, 50)}...
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingNode(node)
                          setShowNodeEditor(true)
                        }}
                        className="p-1 text-gray-400 hover:text-blue-500"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteNode(node.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {index < nodes.length - 1 && (
                    <ArrowDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showNodeEditor && renderNodeEditor()}
    </div>
  )
}