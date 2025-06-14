import { supabase, supabaseAdmin, isSupabaseConfigured } from './supabase'
import { User } from '@/types'

// Supabase設定エラー
export class SupabaseConfigError extends Error {
  constructor(message: string = 'Supabaseの設定が完了していません') {
    super(message)
    this.name = 'SupabaseConfigError'
  }
}

// Supabaseから取得する生データの型
export interface UserRow {
  id: string
  name: string
  line_uid?: string
  address?: string
  phone?: string
  created_at: string
  updated_at: string
  custom_fields?: Record<string, any>
}

// データベースの行をアプリケーションの型に変換
export function transformUserFromDB(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    lineUid: row.line_uid,
    address: row.address,
    phone: row.phone,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    tags: [], // 別途取得が必要
    statusHistory: [], // 別途取得が必要
    reservations: [], // 別途取得が必要
    customFields: row.custom_fields ? {
      birthday: row.custom_fields.birthday ? new Date(row.custom_fields.birthday) : undefined,
      anniversary: row.custom_fields.anniversary ? new Date(row.custom_fields.anniversary) : undefined,
      contractExpiry: row.custom_fields.contractExpiry ? new Date(row.custom_fields.contractExpiry) : undefined,
      subscriptionRenewal: row.custom_fields.subscriptionRenewal ? new Date(row.custom_fields.subscriptionRenewal) : undefined,
      lastPurchaseDate: row.custom_fields.lastPurchaseDate ? new Date(row.custom_fields.lastPurchaseDate) : undefined,
      customDate1: row.custom_fields.customDate1 ? new Date(row.custom_fields.customDate1) : undefined,
      customDate2: row.custom_fields.customDate2 ? new Date(row.custom_fields.customDate2) : undefined,
    } : undefined
  }
}

// ユーザー一覧を取得
export async function getUsers(): Promise<User[]> {
  // Supabase設定チェック
  if (!isSupabaseConfigured()) {
    throw new SupabaseConfigError('Supabaseの認証情報が設定されていません。.env.localファイルを確認してください。')
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      throw error
    }

    return data.map(transformUserFromDB)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    throw error
  }
}

// 特定のユーザーを取得
export async function getUserById(id: string): Promise<User | null> {
  // Supabase設定チェック
  if (!isSupabaseConfigured()) {
    throw new SupabaseConfigError('Supabaseの認証情報が設定されていません。.env.localファイルを確認してください。')
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // ユーザーが見つからない
      }
      console.error('Error fetching user:', error)
      throw error
    }

    return transformUserFromDB(data)
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw error
  }
}

// ユーザーを作成
export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'tags' | 'statusHistory'>): Promise<User> {
  // Supabase設定チェック
  if (!isSupabaseConfigured()) {
    throw new SupabaseConfigError('Supabaseの認証情報が設定されていません。.env.localファイルを確認してください。')
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        name: userData.name,
        line_uid: userData.lineUid,
        address: userData.address,
        phone: userData.phone,
        custom_fields: userData.customFields
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      throw error
    }

    return transformUserFromDB(data)
  } catch (error) {
    console.error('Failed to create user:', error)
    throw error
  }
}

// ユーザーを更新
export async function updateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'tags' | 'statusHistory'>>): Promise<User> {
  // Supabase設定チェック
  if (!isSupabaseConfigured()) {
    throw new SupabaseConfigError('Supabaseの認証情報が設定されていません。.env.localファイルを確認してください。')
  }

  try {
    const updateData: Partial<UserRow> = {}
    
    if (userData.name !== undefined) updateData.name = userData.name
    if (userData.lineUid !== undefined) updateData.line_uid = userData.lineUid
    if (userData.address !== undefined) updateData.address = userData.address
    if (userData.phone !== undefined) updateData.phone = userData.phone
    if (userData.customFields !== undefined) updateData.custom_fields = userData.customFields

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      throw error
    }

    return transformUserFromDB(data)
  } catch (error) {
    console.error('Failed to update user:', error)
    throw error
  }
}

// ユーザーを削除
export async function deleteUser(id: string): Promise<void> {
  // Supabase設定チェック
  if (!isSupabaseConfigured()) {
    throw new SupabaseConfigError('Supabaseの認証情報が設定されていません。.env.localファイルを確認してください。')
  }

  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  } catch (error) {
    console.error('Failed to delete user:', error)
    throw error
  }
}