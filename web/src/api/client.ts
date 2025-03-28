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
  timeout: 10000
});

// 添加请求拦截器，便于调试
apiClient.interceptors.request.use(request => {
  logger.api(request.method?.toUpperCase() || 'UNKNOWN', request.url || '');
  return request;
});

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