import { defineStore } from 'pinia'
import { apiService } from '../api/service'
import logger from '../utils/logger'
import { nanoid } from 'nanoid'
import { generateAirportId } from '../utils/crypto'

// 机场接口定义
export interface Airport {
  id: string    // ID保持必需，因为内部逻辑仍然依赖它
  name: string
  url: string
  description: string
  usedTraffic: number
  totalTraffic: number
  expireTime: number
  // 不显示在UI上，但内部仍保留
}

export const useAirportStore = defineStore('airport', {
  state: () => ({
    airports: [] as Airport[],
    loaded: false,
    loading: false,
    error: null as Error | null
  }),
  
  getters: {
    // 根据ID获取机场
    getAirportById: (state) => (id: string) => {
      return state.airports.find(airport => airport.id === id)
    }
  },
  
  actions: {
    /**
     * 加载机场数据
     */
    async loadAirports() {
      if (this.loading) return
      
      try {
        this.loading = true
        this.error = null
        logger.info('开始加载机场数据...')
        
        const data = await apiService.getAirports()
        logger.debug('从API获取的机场数据:', data)
        
        if (data && Array.isArray(data)) {
          this.airports = data
          logger.info('机场数据已更新到本地状态, 共', this.airports.length, '条记录')
        } else {
          logger.warn('获取到的机场数据格式不正确, 已设置为空数组')
          this.airports = []
        }
        
        this.loaded = true
        return this.airports
      } catch (error) {
        logger.error('加载机场数据失败:', error)
        this.error = error instanceof Error ? error : new Error(String(error))
        this.airports = []
        throw error
      } finally {
        this.loading = false
      }
    },
    
    /**
     * 批量保存机场数据 (旧方法，保持兼容性)
     */
    async saveAirports() {
      try {
        await apiService.saveAirports(this.airports)
        return true
      } catch (error) {
        logger.error('保存机场数据失败:', error)
        this.error = error instanceof Error ? error : new Error(String(error))
        return false
      }
    },
    
    /**
     * 添加机场
     */
    async addAirport(airport: Omit<Airport, 'id'>) {
      try {
        // 根据机场名称和URL生成ID
        const generatedId = generateAirportId(airport.name, airport.url)
        
        // 准备待保存的机场数据
        const airportData = { 
          ...airport, 
          id: generatedId // 使用生成的MD5作为ID
        }
        
        // 检查是否已存在相同ID的机场
        const existingIndex = this.airports.findIndex(a => a.id === generatedId)
        if (existingIndex !== -1) {
          throw new Error('已存在相同名称和URL的机场')
        }
        
        // 保存到服务器
        console.log('保存机场数据:', airportData)
        const result = await apiService.saveAirport(airportData)
        
        if (!result.success) {
          throw new Error('保存机场数据失败')
        }
        
        // 使用服务器返回的ID更新机场数据
        const finalId = result.id
        const finalAirport = { ...airportData, id: finalId }
        
        // 添加到本地数组
        this.airports.push(finalAirport)
        
        logger.info(`成功添加机场, ID: ${finalId}`)
        return finalId
      } catch (error) {
        logger.error('添加机场失败:', error)
        this.error = error instanceof Error ? error : new Error(String(error))
        throw error
      }
    },
    
    /**
     * 更新机场
     */
    async updateAirport(id: string, data: Partial<Omit<Airport, 'id'>>) {
      try {
        // 查找本地机场数据
        const index = this.airports.findIndex(a => a.id === id)
        if (index === -1) {
          throw new Error(`找不到ID为 ${id} 的机场`)
        }
        
        // 准备更新数据
        const currentAirport = this.airports[index]
        const updatedAirport = { ...currentAirport, ...data }
        
        // 如果修改了名称或URL，需要检查新ID是否与旧ID不同
        if ((data.name && data.name !== currentAirport.name) || 
            (data.url && data.url !== currentAirport.url)) {
          
          // 计算新的ID
          const newId = generateAirportId(updatedAirport.name, updatedAirport.url)
          
          // 检查是否已存在相同ID的其他机场（排除当前机场）
          const duplicateIndex = this.airports.findIndex(
            a => a.id === newId && a.id !== id
          )
          
          if (duplicateIndex !== -1) {
            throw new Error('已存在相同名称和URL的机场')
          }
          
          // 如果ID变化，需要处理特殊情况
          if (newId !== id) {
            // 设置新ID
            updatedAirport.id = newId
            
            // 保存到服务器（新文件）
            const saveResult = await apiService.saveAirport(updatedAirport)
            
            if (!saveResult.success) {
              throw new Error('更新机场数据失败')
            }
            
            // 删除旧文件
            await apiService.deleteAirport(id)
            
            // 从本地列表中移除旧记录并添加新记录
            this.airports.splice(index, 1)
            this.airports.push(updatedAirport)
            
            logger.info(`成功更新机场，ID从 ${id} 变更为 ${newId}`)
            return true
          }
        }
        
        // 普通更新情况（ID没有变化）
        const saveResult = await apiService.saveAirport(updatedAirport)
        
        if (!saveResult.success) {
          throw new Error('更新机场数据失败')
        }
        
        // 更新本地数据
        this.airports[index] = updatedAirport
        
        logger.info(`成功更新机场, ID: ${id}`)
        return true
      } catch (error) {
        logger.error('更新机场失败:', error)
        this.error = error instanceof Error ? error : new Error(String(error))
        throw error
      }
    },
    
    /**
     * 删除机场
     */
    async deleteAirport(id: string) {
      try {
        // 查找机场在数组中的索引
        const index = this.airports.findIndex(a => a.id === id)
        if (index === -1) {
          throw new Error(`找不到ID为 ${id} 的机场`)
        }
        
        // 从服务器删除机场数据
        const result = await apiService.deleteAirport(id)
        
        // 更灵活地处理返回值
        // 如果result是布尔值，直接使用；如果是对象，检查.success属性
        const isSuccess = typeof result === 'boolean' ? result : (result && result.success === true)
        
        if (!isSuccess) {
          throw new Error('删除机场数据失败')
        }
        
        // 从本地数组中移除
        this.airports.splice(index, 1)
        
        logger.info(`成功删除机场, ID: ${id}`)
        return true
      } catch (error) {
        logger.error('删除机场失败:', error)
        this.error = error instanceof Error ? error : new Error(String(error))
        throw error
      }
    },
    
    /**
     * 重置状态
     */
    resetState() {
      this.airports = []
      this.loaded = false
      this.loading = false
      this.error = null
    }
  }
}) 