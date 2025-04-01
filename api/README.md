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
项目使用服务器端文件存储数据，具体实现如下：
- 数据以JSON格式存储在服务器端的`api/data`目录中
- 服务器API提供数据的读写操作
- 前端通过API与服务器交互，不再使用localStorage

## 配置自动更新功能
项目实现了mx.yaml配置文件的自动更新功能：
- 所有操作均在服务端自动处理，无需客户端干预
- 当机场信息发生变化（添加、修改、删除机场）时，服务端自动更新mx.yaml
- 当订阅规则模板（subscription_rules.yaml）更新时，服务端自动更新mx.yaml
- 自动更新使用LiquidJS模板引擎，将机场信息作为上下文参数注入到订阅规则模板中
- 核心实现位于服务端的updateMxYaml函数，确保了数据变更与配置文件更新的一致性

## 数据存储路径
- 机场数据：`api/data/airports.json`
- 订阅规则：`api/data/subscriptionRules.json`
- 简单订阅规则：`api/data/subscription_rules.json`
- 生成的配置文件: `api/data/mx.yaml`

## 错误处理

所有 API 端点在发生错误时会返回适当的 HTTP 状态码和错误信息。 