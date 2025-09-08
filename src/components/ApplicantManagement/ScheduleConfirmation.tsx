'use client'

import { useState } from 'react'
import { agentsData } from '@/data/agents'

interface Applicant {
  id: number
  name: string
  email: string
  position: string
  availableDates: Array<{
    date: string
    timeSlots: string[]
  }>
}

interface ScheduleConfirmationProps {
  applicant: Applicant
  onConfirm: (date: string, time: string, agent: string) => void
  onCancel: () => void
}

export default function ScheduleConfirmation({ 
  applicant, 
  onConfirm, 
  onCancel 
}: ScheduleConfirmationProps) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('')
  const [location, setLocation] = useState('オンライン')
  const [notes, setNotes] = useState('')

  const getAvailableTimeSlots = () => {
    const selectedDateInfo = applicant.availableDates.find(d => d.date === selectedDate)
    return selectedDateInfo ? selectedDateInfo.timeSlots : []
  }

  const handleConfirm = () => {
    if (selectedDate && selectedTime && selectedAgent) {
      onConfirm(selectedDate, selectedTime, selectedAgent)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">面談日程の確定</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              求職者名
            </label>
            <p className="text-gray-900">{applicant.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              希望日程から選択
            </label>
            <div className="space-y-2">
              {applicant.availableDates.map((dateInfo) => (
                <label
                  key={dateInfo.date}
                  className={`block p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedDate === dateInfo.date
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="date"
                      value={dateInfo.date}
                      checked={selectedDate === dateInfo.date}
                      onChange={(e) => {
                        setSelectedDate(e.target.value)
                        setSelectedTime('') // Reset time when date changes
                      }}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{dateInfo.date}</span>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {dateInfo.timeSlots.map((time) => (
                          <span
                            key={time}
                            className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-600"
                          >
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                時間帯を選択
              </label>
              <div className="grid grid-cols-4 gap-2">
                {getAvailableTimeSlots().map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      selectedTime === time
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              担当エージェントを選択
            </label>
            <div className="grid grid-cols-2 gap-2">
              {agentsData.map((agent) => (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedAgent === agent.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">{agent.name}</div>
                  <div className="text-xs text-gray-500">{agent.role}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              面談形式
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="location"
                  value="オンライン"
                  checked={location === 'オンライン'}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">オンライン</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="location"
                  value="対面"
                  checked={location === '対面'}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">対面</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              備考・メモ
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="面談に関する備考やメモを入力してください"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime || !selectedAgent}
            className={`px-6 py-2 text-white rounded-lg ${
              selectedDate && selectedTime && selectedAgent
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            面談を確定する
          </button>
        </div>
      </div>

      {selectedDate && selectedTime && selectedAgent && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 mb-2">
            <strong>確定内容:</strong>
          </p>
          <div className="text-sm text-blue-700 space-y-1">
            <div>📅 {selectedDate} {selectedTime}</div>
            <div>👤 担当: {agentsData.find(a => a.id === selectedAgent)?.name}</div>
            <div>📍 形式: {location}</div>
          </div>
        </div>
      )}
    </div>
  )
}