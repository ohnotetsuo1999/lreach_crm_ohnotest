import { UserAction, ActionRule, TagAction, User, Tag, Status } from '@/types'

export class ActionProcessor {
  private actionRules: ActionRule[]
  private users: User[]
  private tags: Tag[]
  private statuses: Status[]

  constructor(actionRules: ActionRule[], users: User[], tags: Tag[], statuses: Status[]) {
    this.actionRules = actionRules.filter(rule => rule.isActive).sort((a, b) => b.priority - a.priority)
    this.users = users
    this.tags = tags
    this.statuses = statuses
  }

  /**
   * ユーザーアクションを処理してタグ付与やステータス変更を実行
   */
  async processAction(userAction: UserAction): Promise<{
    userId: string
    appliedRules: string[]
    addedTags: string[]
    removedTags: string[]
    statusChanges: string[]
    errors: string[]
  }> {
    const result = {
      userId: userAction.userId,
      appliedRules: [] as string[],
      addedTags: [] as string[],
      removedTags: [] as string[],
      statusChanges: [] as string[],
      errors: [] as string[]
    }

    const user = this.users.find(u => u.id === userAction.userId)
    if (!user) {
      result.errors.push('ユーザーが見つかりません')
      return result
    }

    // マッチするルールを見つける
    const matchingRules = this.findMatchingRules(userAction)

    for (const rule of matchingRules) {
      try {
        const ruleResult = await this.applyRule(rule, user, userAction)
        result.appliedRules.push(rule.id)
        result.addedTags.push(...ruleResult.addedTags)
        result.removedTags.push(...ruleResult.removedTags)
        result.statusChanges.push(...ruleResult.statusChanges)
      } catch (error) {
        result.errors.push(`ルール ${rule.id} の適用中にエラー: ${error}`)
      }
    }

    return result
  }

  /**
   * アクションにマッチするルールを検索
   */
  private findMatchingRules(userAction: UserAction): ActionRule[] {
    return this.actionRules.filter(rule => {
      // アクション種別チェック
      if (rule.actionType !== userAction.actionType) {
        return false
      }

      // テンプレート特定チェック
      if (rule.templateId && rule.templateId !== userAction.templateId) {
        return false
      }

      // 条件チェック
      return this.evaluateCondition(rule.actionCondition, userAction.actionValue)
    })
  }

  /**
   * アクション条件を評価
   */
  private evaluateCondition(condition: ActionRule['actionCondition'], value: string): boolean {
    switch (condition.operator) {
      case 'any':
        return true
      case 'equals':
        return value === condition.value
      case 'contains':
        return value.includes(condition.value || '')
      case 'starts_with':
        return value.startsWith(condition.value || '')
      case 'ends_with':
        return value.endsWith(condition.value || '')
      case 'regex':
        try {
          const regex = new RegExp(condition.regex || '')
          return regex.test(value)
        } catch {
          return false
        }
      default:
        return false
    }
  }

  /**
   * ルールを適用してタグアクションを実行
   */
  private async applyRule(rule: ActionRule, user: User, userAction: UserAction): Promise<{
    addedTags: string[]
    removedTags: string[]
    statusChanges: string[]
  }> {
    const result = {
      addedTags: [] as string[],
      removedTags: [] as string[],
      statusChanges: [] as string[]
    }

    for (const tagAction of rule.tagActions) {
      // 条件チェック
      if (tagAction.condition && !this.evaluateTagActionCondition(tagAction.condition, user)) {
        continue
      }

      switch (tagAction.type) {
        case 'ADD_TAG':
          if (tagAction.tagId) {
            const tag = this.tags.find(t => t.id === tagAction.tagId)
            if (tag && !user.tags.some(t => t.id === tagAction.tagId)) {
              // ここで実際のタグ追加処理を実行
              // await this.addTagToUser(user.id, tagAction.tagId)
              result.addedTags.push(tag.name)
            }
          }
          break

        case 'REMOVE_TAG':
          if (tagAction.tagId) {
            const tag = this.tags.find(t => t.id === tagAction.tagId)
            if (tag && user.tags.some(t => t.id === tagAction.tagId)) {
              // ここで実際のタグ削除処理を実行
              // await this.removeTagFromUser(user.id, tagAction.tagId)
              result.removedTags.push(tag.name)
            }
          }
          break

        case 'SET_STATUS':
          if (tagAction.statusId) {
            const status = this.statuses.find(s => s.id === tagAction.statusId)
            const currentStatus = user.statusHistory[user.statusHistory.length - 1]?.status
            if (status && currentStatus?.id !== tagAction.statusId) {
              // ここで実際のステータス変更処理を実行
              // await this.changeUserStatus(user.id, tagAction.statusId)
              result.statusChanges.push(status.label)
            }
          }
          break
      }
    }

    return result
  }

  /**
   * タグアクション条件を評価
   */
  private evaluateTagActionCondition(condition: TagAction['condition'], user: User): boolean {
    if (!condition) return true

    // 必要なタグを持っているかチェック
    if (condition.ifHasTag) {
      const hasAllTags = condition.ifHasTag.every(tagId =>
        user.tags.some(t => t.id === tagId)
      )
      if (!hasAllTags) return false
    }

    // 持っていてはいけないタグをチェック
    if (condition.ifNotHasTag) {
      const hasAnyTag = condition.ifNotHasTag.some(tagId =>
        user.tags.some(t => t.id === tagId)
      )
      if (hasAnyTag) return false
    }

    // ステータス条件チェック
    if (condition.ifStatus) {
      const currentStatus = user.statusHistory[user.statusHistory.length - 1]?.status
      if (currentStatus?.id !== condition.ifStatus) return false
    }

    return true
  }

  /**
   * Webhookデータからユーザーアクションを作成
   */
  static createUserActionFromWebhook(webhookData: any): UserAction | null {
    try {
      // LINE Webhookの種類に応じてアクションを生成
      const { type, message, postback, source } = webhookData

      let actionType: UserAction['actionType']
      let actionValue: string
      let metadata: Record<string, any> = {}

      switch (type) {
        case 'message':
          if (message.type === 'text') {
            actionType = 'REPLY'
            actionValue = message.text
          } else {
            return null
          }
          break

        case 'postback':
          actionType = 'POSTBACK'
          actionValue = postback.data
          metadata = { displayText: postback.displayText }
          break

        case 'follow':
        case 'unfollow':
          // フォロー/アンフォローはカスタムアクションとして処理
          actionType = 'CUSTOM'
          actionValue = type
          break

        default:
          return null
      }

      return {
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: source.userId,
        templateId: '', // Webhookからは特定困難、別途関連付け必要
        deliveryLogId: '', // 同上
        actionType,
        actionValue,
        metadata,
        timestamp: new Date(),
        processed: false
      }
    } catch (error) {
      console.error('Failed to create user action from webhook:', error)
      return null
    }
  }

  /**
   * URL クリック追跡用のトラッキングURL生成
   */
  static generateTrackingUrl(originalUrl: string, userId: string, templateId: string): string {
    const trackingParams = new URLSearchParams({
      u: userId,
      t: templateId,
      url: originalUrl
    })
    
    // 実際の本番環境では独自のトラッキングドメインを使用
    return `https://track.example.com/click?${trackingParams.toString()}`
  }

  /**
   * トラッキングURLからクリックアクションを作成
   */
  static createClickActionFromTracking(trackingData: {
    userId: string
    templateId: string
    originalUrl: string
    userAgent?: string
    ip?: string
  }): UserAction {
    return {
      id: `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: trackingData.userId,
      templateId: trackingData.templateId,
      deliveryLogId: '', // 配信ログIDとの関連付けは別途必要
      actionType: 'URL_CLICK',
      actionValue: trackingData.originalUrl,
      metadata: {
        userAgent: trackingData.userAgent,
        ip: trackingData.ip,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      processed: false
    }
  }
}

/**
 * アクション処理のサンプル実装例
 */
export class ActionProcessorService {
  private processor: ActionProcessor

  constructor(actionRules: ActionRule[], users: User[], tags: Tag[], statuses: Status[]) {
    this.processor = new ActionProcessor(actionRules, users, tags, statuses)
  }

  /**
   * リアルタイムでアクションを処理
   */
  async handleRealTimeAction(userAction: UserAction) {
    const result = await this.processor.processAction(userAction)
    
    // 結果をログ出力
    console.log('Action processed:', {
      userId: result.userId,
      appliedRules: result.appliedRules.length,
      changes: {
        addedTags: result.addedTags,
        removedTags: result.removedTags,
        statusChanges: result.statusChanges
      },
      errors: result.errors
    })

    // 必要に応じて通知や外部システム連携
    if (result.addedTags.length > 0 || result.statusChanges.length > 0) {
      await this.notifyTagChanges(result)
    }

    return result
  }

  /**
   * バッチでアクションを処理
   */
  async processBatchActions(userActions: UserAction[]) {
    const results = []
    
    for (const action of userActions) {
      const result = await this.processor.processAction(action)
      results.push(result)
    }

    return results
  }

  /**
   * タグ変更通知
   */
  private async notifyTagChanges(result: any) {
    // Slack、メール、Webhookなどへの通知実装
    console.log('Tag changes notification:', result)
  }
}