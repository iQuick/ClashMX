import axios from 'axios';
import logger from '../utils/logger';

// 定义API基础URL，优先使用环境变量，否则使用当前域名
export const API_BASE_URL = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // 增加超时设置
  timeout: 60 * 1000
});

// 添加请求拦截器，便于调试
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    logger.api(config.method?.toUpperCase() || 'UNKNOWN', config.url || '');
    return config;
  },
  (error) => {
    logger.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 添加响应拦截器，便于调试
apiClient.interceptors.response.use(
  response => {
    logger.apiResponse(response.config.url || '', response.status, response.data);
    return response;
  },
  error => {
    logger.apiError(error.config?.url || '', error);
    return Promise.reject(error);
  }
);

export default apiClient; 