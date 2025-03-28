import { defineStore } from 'pinia'
import { apiService } from '../api/service'

interface SimpleRuleState {
  content: string
  loaded: boolean
  loading: boolean
  error: Error | null
  lastSaved: Date | null
}

export const useSimpleRuleStore = defineStore('simpleRule', {
  state: (): SimpleRuleState => ({
    content: '',
    loaded: false,
    loading: false,
    error: null,
    lastSaved: null
  }),
  
  getters: {
    isEmpty(state): boolean {
      return !state.content || state.content.trim() === ''
    }
  },
  
  actions: {
    async loadSimpleRules(): Promise<string> {
      this.loading = true
      this.error = null
      
      try {
        const content = await apiService.getSubscription()
        this.content = content
        this.loaded = true
        return content
      } catch (error) {
        this.error = error instanceof Error ? error : new Error(String(error))
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async saveSimpleRules(): Promise<boolean> {
      try {
        await apiService.saveSubscription(this.content)
        this.lastSaved = new Date()
        return true
      } catch (error) {
        this.error = error instanceof Error ? error : new Error(String(error))
        return false
      }
    },
    
    async saveProcessedContent(content: string): Promise<boolean> {
      try {
        const contentStr = typeof content === 'string' ? content : JSON.stringify(content)
        await apiService.saveMxYaml(contentStr)
        this.lastSaved = new Date()
        return true
      } catch (error) {
        this.error = error instanceof Error ? error : new Error(String(error))
        return false
      }
    },
    
    updateContent(newContent: string): void {
      this.content = newContent
      this.error = null
    }
  }
}) 