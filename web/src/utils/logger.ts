// 日志开关，优先使用环境变量，否则在生产环境下关闭，开发环境下开启
const ENABLE_LOGGING = import.meta.env.logger.enabled

// 日志级别定义
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// 日志级别数值映射（数值越大，级别越高）
const LOG_LEVEL_MAP: Record<LogLevel, number> = {
  'debug': 0,
  'info': 1,
  'warn': 2,
  'error': 3
};

// 当前日志级别，默认为info，可通过环境变量设置
const CURRENT_LOG_LEVEL = (() => {
  const levelFromEnv = import.meta.env.logger.level as LogLevel | undefined;
  // 验证级别是否有效
  if (levelFromEnv && LOG_LEVEL_MAP[levelFromEnv] !== undefined) {
    return levelFromEnv;
  }
  // 默认级别
  return 'info';
})();

// 当前日志级别的数值
const CURRENT_LOG_LEVEL_VALUE = LOG_LEVEL_MAP[CURRENT_LOG_LEVEL];

// 判断给定级别是否应该显示
const shouldLogLevel = (level: LogLevel): boolean => {
  return ENABLE_LOGGING && LOG_LEVEL_MAP[level] >= CURRENT_LOG_LEVEL_VALUE;
};

/**
 * 日志服务
 */
const logger = {
  // 获取当前日志级别
  getLogLevel(): LogLevel {
    return CURRENT_LOG_LEVEL;
  },

  // 调试级别日志
  debug(...args: any[]) {
    if (shouldLogLevel('debug')) {
      console.debug('[调试]', ...args);
    }
  },

  // 信息级别日志
  info(...args: any[]) {
    if (shouldLogLevel('info')) {
      console.info('[信息]', ...args);
    }
  },

  // 警告级别日志
  warn(...args: any[]) {
    if (shouldLogLevel('warn')) {
      console.warn('[警告]', ...args);
    }
  },

  // 错误级别日志
  error(...args: any[]) {
    if (shouldLogLevel('error')) {
      console.error('[错误]', ...args);
    }
  },

  // API请求日志 (info级别)
  api(method: string, url: string, data?: any) {
    if (shouldLogLevel('info')) {
      console.info(`[API请求] ${method} ${url}`);
      if (data && shouldLogLevel('debug')) {
        console.debug('[API请求数据]', data);
      }
    }
  },

  // API响应日志 (info级别)
  apiResponse(url: string, status: number, data: any) {
    if (shouldLogLevel('info')) {
      console.info(`[API响应] ${url} 状态: ${status}`);
      
      if (data !== undefined && shouldLogLevel('debug')) {
        const type = typeof data;
        console.debug(`[API响应数据] 类型: ${type}`);
        
        if (type === 'string') {
          console.debug(`[API响应内容] ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
        } else {
          console.debug('[API响应内容]', data);
        }
      }
    }
  },

  // API错误日志 (error级别)
  apiError(url: string, error: any) {
    if (shouldLogLevel('error')) {
      console.error(`[API错误] ${url} 错误: ${error.message || '未知错误'}`);
      
      if (error.response) {
        console.error(`[API错误详情] 状态: ${error.response.status}`, error.response.data);
      }
    }
  }
};

// 导出默认对象
export default logger; 