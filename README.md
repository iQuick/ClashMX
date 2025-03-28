# 项目结构
```
clash-mx/
├── api/             # 后端API服务
│   ├── data/        # 数据存储目录
│   ├── index.js     # API服务主文件
│   └── package.json # API服务依赖
└── web/             # 前端应用
    ├── public/      # 静态资源
    ├── src/         # 源代码
    └── package.json # 前端依赖
```

# 数据存储
项目使用服务器端文件存储数据，具体实现如下：
- 数据以JSON格式存储在服务器端的`api/data`目录中
- 服务器API提供数据的读写操作
- 前端通过API与服务器交互，不再使用localStorage

# 配置自动更新功能
项目实现了mx.yaml配置文件的自动更新功能：
- 所有操作均在服务端自动处理，无需客户端干预
- 当机场信息发生变化（添加、修改、删除机场）时，服务端自动更新mx.yaml
- 当订阅规则模板（subscription_rules.yaml）更新时，服务端自动更新mx.yaml
- 自动更新使用LiquidJS模板引擎，将机场信息作为上下文参数注入到订阅规则模板中
- 核心实现位于服务端的updateMxYaml函数，确保了数据变更与配置文件更新的一致性

## 如何启动项目
1. 安装依赖
```
npm run setup
```
或者分别安装：
```
npm run api:setup  # 安装API服务依赖
npm run web:setup  # 安装前端依赖
```

2. 启动项目（同时启动前端和后端服务）
```
npm start
```

或者分别启动：
- 启动后端服务：`npm run api:start`
- 启动前端服务：`npm run web:dev`

## 数据存储路径
- 机场数据：`api/data/airports.json`
- 订阅规则：`api/data/subscriptionRules.json`
- 简单订阅规则：`api/data/subscription_rules.json`
- 生成的配置文件: `api/data/mx.yaml`

## 从localStorage迁移
当前版本已经实现了从localStorage到服务器存储的自动迁移功能。当首次启动服务器时，如果检测到localStorage中有数据，系统会自动将数据迁移到服务器，无需手动操作。