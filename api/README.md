# Clash-MX API 服务

该服务为 Clash-MX 提供数据存储和访问功能，使用简单的文件存储方式。

## 安装

```bash
npm install
```

## 启动服务

```bash
npm start
```

或者使用开发模式（自动重启）:

```bash
npm run dev
```

## API 端点

### 机场数据

- `GET /api/airports` - 获取所有机场数据
- `POST /api/airports` - 保存机场数据

### 订阅规则

- `GET /api/subscription-rules` - 获取所有订阅规则
- `POST /api/subscription-rules` - 保存订阅规则

### 简单订阅规则

- `GET /api/subscription` - 获取简单订阅规则
- `POST /api/subscription` - 保存简单订阅规则

## 数据存储

所有数据以 JSON 格式存储在 `data` 目录下：

- `data/airports.json` - 机场数据
- `data/subscriptionRules.json` - 订阅规则
- `data/subscription_rules.json` - 简单订阅规则

## 错误处理

所有 API 端点在发生错误时会返回适当的 HTTP 状态码和错误信息。 