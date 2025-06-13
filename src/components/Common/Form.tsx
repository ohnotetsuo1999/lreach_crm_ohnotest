'use client'

import { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface FormFieldProps {
  label: string
  children: ReactNode
  required?: boolean
  error?: string
  helperText?: string
  className?: string
}

export function FormField({ 
  label, 
  children, 
  required = false, 
  error, 
  helperText,
  className = ''
}: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function Input({ error, className = '', ...props }: InputProps) {
  return (
    <input
      className={`
        block w-full px-3 py-2 border rounded-md shadow-sm
        focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
        ${error ? 'border-red-300' : 'border-gray-300'}
        ${className}
      `}
      {...props}
    />
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

export function Select({ error, options, placeholder, className = '', ...props }: SelectProps) {
  return (
    <select
      className={`
        block w-full px-3 py-2 border rounded-md shadow-sm
        focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
        ${error ? 'border-red-300' : 'border-gray-300'}
        ${className}
      `}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function Textarea({ error, className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={`
        block w-full px-3 py-2 border rounded-md shadow-sm
        focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
        ${error ? 'border-red-300' : 'border-gray-300'}
        ${className}
      `}
      {...props}
    />
  )
}

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  description?: string
}

export function Checkbox({ label, description, className = '', ...props }: CheckboxProps) {
  return (
    <div className={`flex items-start ${className}`}>
      <input
        type="checkbox"
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
        {...props}
      />
      <div className="ml-3">
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
    </div>
  )
}

interface FormActionsProps {
  children: ReactNode
  className?: string
}

export function FormActions({ children, className = '' }: FormActionsProps) {
  return (
    <div className={`flex justify-end space-x-3 ${className}`}>
      {children}
    </div>
  )
}

interface FormGroupProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function FormGroup({ children, columns = 1, className = '' }: FormGroupProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {children}
    </div>
  )
}