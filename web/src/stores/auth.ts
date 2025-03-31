import { defineStore } from 'pinia'
import { apiService } from '../api/service'
import logger from '@/utils/logger'

interface User {
  id: number
  username: string
  role: string
}

interface AuthState {
  authenticated: boolean
  user: User | null
  error: string
  loading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    authenticated: false,
    user: null,
    error: '',
    loading: false
  }),

  getters: {
    isAuthenticated(state): boolean {
      return state.authenticated
    },
    getUser(state): User | null {
      return state.user
    }
  },

  actions: {
    async login(username: string, password: string) {
      try {
        this.loading = true
        const result = await apiService.login(username, password)
        if (result.success) {
          this.authenticated = true
          this.user = result.data?.user || null
          this.error = ''
          logger.info('用户登录成功')
          return result
        } else {
          this.authenticated = false
          this.error = result.error || '登录失败'
          logger.error('用户登录失败:', this.error)
          return result
        }
      } catch (err) {
        this.authenticated = false
        this.error = '登录失败'
        logger.error('登录过程发生错误:', err)
        return { success: false, error: '登录失败' }
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.authenticated = false
      this.user = null
      logger.info('用户已登出')
    },

  },

  persist: {
    storage: localStorage
  }

}) 