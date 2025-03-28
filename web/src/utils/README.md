# 日志系统使用说明

## 简介

ClashMX 提供了一个集中式的日志管理系统，允许应用程序在不同地方记录日志。日志系统支持通过环境变量控制是否启用日志以及显示的日志级别。

## 配置方法

### 环境变量配置

在 `.env` 文件中可以通过以下环境变量控制日志行为：

```
# 启用日志（true/false）
VITE_ENABLE_LOGS=true

# 日志级别（debug/info/warn/error）
VITE_LOG_LEVEL=info
```

#### 日志级别说明

日志级别从低到高依次为：

1. `debug`：显示所有日志，包括详细的调试信息
2. `info`：显示信息、警告和错误日志（默认）
3. `warn`：只显示警告和错误日志
4. `error`：只显示错误日志

设置某个级别后，只会显示该级别及更高级别的日志。

#### 默认行为

- **启用日志**：
  - 在开发环境下，默认开启日志（`import.meta.env.DEV === true` 时）
  - 在生产环境下，默认关闭日志

- **日志级别**：
  - 默认级别为 `info`

## 开发者使用方法

### 在代码中使用日志

```typescript
import logger from '../utils/logger';

// 不同级别的日志
logger.debug('调试信息', data);    // 仅在debug级别及以上显示
logger.info('普通信息');           // 仅在info级别及以上显示
logger.warn('警告信息');           // 仅在warn级别及以上显示
logger.error('错误信息', error);   // 仅在error级别及以上显示

// API相关日志
logger.api('GET', '/api/endpoint', requestData);  // info级别
logger.apiResponse('/api/endpoint', 200, responseData);  // info级别，详细数据为debug级别
logger.apiError('/api/endpoint', error);  // error级别

// 获取当前日志级别
const currentLevel = logger.getLogLevel();  // 'debug', 'info', 'warn' 或 'error'
```

## 最佳实践

1. **合理选择日志级别**：
   - `debug`：仅用于详细的调试信息
   - `info`：记录系统正常运行的信息
   - `warn`：潜在问题的警告
   - `error`：必须处理的错误

2. **开发和生产环境配置**：
   - 开发环境：启用日志，级别设为 `debug` 或 `info`
   - 生产环境：可禁用日志，或将级别设为 `warn` 或 `error`

3. **避免敏感信息**：不要记录密码、令牌等敏感信息
4. **简洁明了**：日志信息应简洁明了，便于查找问题

## 环境配置示例

### 开发环境 (.env.development)

```
VITE_ENABLE_LOGS=true
VITE_LOG_LEVEL=debug
```

### 生产环境 (.env.production)

```
VITE_ENABLE_LOGS=false  # 完全禁用日志
# 或者只显示警告和错误
# VITE_ENABLE_LOGS=true
# VITE_LOG_LEVEL=warn
```

## 日志格式

所有日志都以统一格式输出，包括:
- 日志级别标记：`[调试]`, `[信息]`, `[警告]`, `[错误]`
- 上下文信息：根据日志类型可能包括URL、状态码、类型等 