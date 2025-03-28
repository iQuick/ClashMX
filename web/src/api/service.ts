import apiClient from './client';
import { AxiosError } from 'axios';
import logger from '../utils/logger';
import { generateAirportId } from '../utils/crypto';

export const apiService = {
  // 机场相关API
  async getAirports() {
    try {
      logger.info('正在获取机场数据...');
      const response = await apiClient.get('/airports');
      
      // 增加响应数据检查
      if (!response || !response.data) {
        logger.error('API响应异常: 返回了空数据');
        return [];
      }
      
      logger.info('获取机场数据成功, 状态码:', response.status);
      logger.debug('响应数据类型:', typeof response.data, Array.isArray(response.data) ? '是数组' : '非数组');
      logger.debug('响应数据内容:', response.data);
      
      // 确保返回的是数组
      if (!Array.isArray(response.data)) {
        logger.warn('API返回的机场数据不是数组格式，将返回空数组');
        return [];
      }
      
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      logger.error('获取机场数据失败:', error);
      logger.error('错误详情:', axiosError.response?.status, axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  // 获取单个机场数据
  async getAirport(id: string) {
    try {
      logger.info(`正在获取机场数据, ID: ${id}...`);
      const response = await apiClient.get(`/airports/${id}`);
      
      logger.info('获取机场数据成功');
      logger.debug('机场数据:', response.data);
      
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      logger.error(`获取机场数据失败, ID: ${id}:`, error);
      logger.error('错误详情:', axiosError.response?.status, axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  // 保存单个机场数据
  async saveAirport(data: any) {
    try {
      logger.info('正在保存单个机场数据...');
      logger.debug('保存的数据:', data);
      
      // 确保必须的字段存在
      if (!data.name || !data.url) {
        logger.error('机场数据缺少必要字段');
        throw new Error('机场数据必须包含名称和URL');
      }
      
      // 记录ID生成信息（仅用于调试）
      if (data.id) {
        logger.debug(`使用现有ID: ${data.id}`);
      } else {
        const calculatedId = generateAirportId(data.name, data.url);
        logger.debug(`未提供ID，将由服务端生成，预计ID: ${calculatedId}`);
      }
      
      const response = await apiClient.post('/airports/single', data);
      logger.info('保存机场数据成功');
      logger.debug('响应数据:', response.data);
      
      // 返回带有ID的响应
      return {
        success: response.data.success,
        id: response.data.id
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      logger.error('保存机场数据失败:', error);
      logger.error('错误详情:', axiosError.response?.status, axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  // 删除单个机场数据
  async deleteAirport(id: string) {
    try {
      logger.info(`正在删除机场数据, ID: ${id}...`);
      const response = await apiClient.delete(`/airports/${id}`);
      
      logger.info('删除机场数据成功');
      logger.debug('响应数据:', response.data);
      
      // 返回完整的响应数据，而不仅仅是success属性
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      logger.error(`删除机场数据失败, ID: ${id}:`, error);
      logger.error('错误详情:', axiosError.response?.status, axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  async saveAirports(data: any) {
    try {
      logger.info('正在批量保存机场数据...');
      logger.debug('保存的数据:', data);
      
      // 检查数据格式
      if (!Array.isArray(data)) {
        logger.error('保存的机场数据不是数组格式');
        throw new Error('机场数据必须是数组格式');
      }
      
      const response = await apiClient.post('/airports', data);
      logger.info('保存机场数据成功, 状态码:', response.status);
      logger.debug('响应数据:', response.data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      logger.error('保存机场数据失败:', error);
      logger.error('错误详情:', axiosError.response?.status, axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  
  async queryAirportInfoByUrl(url: string) {
    try {
      logger.info('正在查询机场信息...');
      
      // 检查URL是否为空
      if (!url || url.trim() === '') {
        logger.error('URL参数为空');
        return { 
          success: false, 
          error: '订阅地址不能为空' 
        };
      }
      
      // 确保URL格式正确，尝试进行简单验证
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        logger.error('URL格式不正确:', url);
        return { 
          success: false, 
          error: '订阅地址格式不正确，必须以http://或https://开头' 
        };
      }
      
      // 编码URL参数，确保安全传输
      const encodedUrl = encodeURIComponent(url);
      const response = await apiClient.get(`/airport-info?url=${encodedUrl}`);
      
      logger.info('查询机场信息成功');
      logger.debug('查询结果:', response.data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      logger.error('查询机场信息失败:', error);
      logger.error('错误详情:', axiosError.response?.status, axiosError.response?.data || axiosError.message);
      
      // 返回格式化的错误信息，而不是抛出异常
      return { 
        success: false, 
        error: axiosError.message || '查询机场信息失败' 
      };
    }
  },

  // 订阅规则相关API
  async getSubscriptionRules() {
    try {
      logger.info('正在获取订阅规则...');
      const response = await apiClient.get('/subscription-rules');
      logger.info('获取订阅规则成功');
      logger.debug('订阅规则数据:', response.data);
      return response.data;
    } catch (error) {
      logger.error('获取订阅规则失败:', error);
      throw error;
    }
  },

  async saveSubscriptionRules(data: any) {
    try {
      logger.info('正在保存订阅规则...');
      const response = await apiClient.post('/subscription-rules', data);
      logger.info('保存订阅规则成功');
      return response.data;
    } catch (error) {
      logger.error('保存订阅规则失败:', error);
      throw error;
    }
  },

  // 简单订阅规则相关API
  async getSubscription() {
    try {
      logger.info('正在获取简单订阅规则...');
      const response = await apiClient.get('/subscription');
      logger.info('获取简单订阅规则成功, 数据类型:', typeof response.data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      logger.error('获取简单订阅规则失败:', error);
      logger.error('错误详情:', axiosError.response?.status, axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  async saveSubscription(data: any) {
    try {
      logger.info('正在保存简单订阅规则...');
      logger.debug('保存的数据类型:', typeof data);
      logger.debug('保存的数据值:', data);
      
      // 完全绕过axios，使用基础fetch API直接发送原始文本
      // 这避免了axios可能的任何自动转换或处理
      const apiUrl = `${apiClient.defaults.baseURL}/subscription`;
      logger.debug('请求URL:', apiUrl);
      
      const fetchResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: data // 直接发送原始文本，不做任何处理
      });
      
      logger.debug('Fetch响应状态:', fetchResponse.status);
      const responseData = await fetchResponse.json();
      logger.debug('Fetch响应数据:', responseData);
      
      if (!fetchResponse.ok) {
        throw new Error(`请求失败: ${fetchResponse.status} ${fetchResponse.statusText}`);
      }
      
      return responseData;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      logger.error('保存简单订阅规则失败:', error);
      logger.error('错误详情:', axiosError.response?.status, axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  // 保存处理后的mx.yaml文件（处理过的订阅规则）
  async saveMxYaml(data: any) {
    try {
      logger.info('正在保存处理后的订阅规则到mx.yaml...');
      logger.debug('保存的数据类型:', typeof data);
      
      // 使用fetch API直接发送原始文本
      const apiUrl = `${apiClient.defaults.baseURL}/mx.yaml-content`;
      logger.debug('请求URL:', apiUrl);
      
      const fetchResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: data // 直接发送原始文本
      });
      
      logger.debug('Fetch响应状态:', fetchResponse.status);
      const responseData = await fetchResponse.json();
      logger.debug('Fetch响应数据:', responseData);
      
      if (!fetchResponse.ok) {
        throw new Error(`请求失败: ${fetchResponse.status} ${fetchResponse.statusText}`);
      }
      
      return responseData;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      logger.error('保存mx.yaml文件失败:', error);
      logger.error('错误详情:', axiosError.response?.status, axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

}; 