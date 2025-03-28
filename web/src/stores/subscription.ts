import { defineStore } from 'pinia'
import { apiService } from '../api/service'
import logger from '../utils/logger'

// 订阅规则接口定义
export interface SubscriptionRule {
  id: string
  name: string
  airports: string[] // 机场ID数组
  rules: string[] // 规则数组
}

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    rules: [] as SubscriptionRule[],
    loaded: false,
    loading: false,
    error: null as Error | null
  }),
  
  getters: {
    // 根据ID获取订阅规则
    getRuleById: (state) => (id: string) => {
      return state.rules.find(rule => rule.id === id)
    },
    
    // 根据机场ID获取相关规则
    getRulesByAirportId: (state) => (airportId: string) => {
      return state.rules.filter(rule => rule.airports.includes(airportId))
    }
  },
  
  actions: {
    /**
     * 加载订阅规则
     */
    async loadSubscriptionRules() {
      if (this.loading) return
      
      try {
        this.loading = true
        this.error = null
        logger.info('开始加载订阅规则...')
        
        const data = await apiService.getSubscriptionRules()
        
        if (data && Array.isArray(data)) {
          this.rules = data
          logger.info('订阅规则已更新到本地状态, 共', this.rules.length, '条记录')
        } else {
          logger.warn('获取到的订阅规则格式不正确, 已设置为空数组')
          this.rules = []
        }
        
        this.loaded = true
        return this.rules
      } catch (error) {
        logger.error('加载订阅规则失败:', error)
        this.error = error instanceof Error ? error : new Error(String(error))
        this.rules = []
        throw error
      } finally {
        this.loading = false
      }
    },
    
    /**
     * 保存订阅规则
     */
    async saveSubscriptionRules() {
      try {
        await apiService.saveSubscriptionRules(this.rules)
        return true
      } catch (error) {
        logger.error('保存订阅规则失败:', error)
        this.error = error instanceof Error ? error : new Error(String(error))
        return false
      }
    },
    
    /**
     * 添加订阅规则
     */
    async addSubscriptionRule(rule: Omit<SubscriptionRule, 'id'>) {
      const id = Date.now().toString()
      this.rules.push({ ...rule, id })
      await this.saveSubscriptionRules()
      return id
    },
    
    /**
     * 更新订阅规则
     */
    async updateSubscriptionRule(id: string, data: Partial<Omit<SubscriptionRule, 'id'>>) {
      const index = this.rules.findIndex(r => r.id === id)
      if (index !== -1) {
        this.rules[index] = { ...this.rules[index], ...data }
        await this.saveSubscriptionRules()
        return true
      }
      return false
    },
    
    /**
     * 删除订阅规则
     */
    async deleteSubscriptionRule(id: string) {
      const index = this.rules.findIndex(r => r.id === id)
      if (index !== -1) {
        this.rules.splice(index, 1)
        await this.saveSubscriptionRules()
        return true
      }
      return false
    },
    
    /**
     * 重置状态
     */
    resetState() {
      this.rules = []
      this.loaded = false
      this.loading = false
      this.error = null
    }
  }
}) 