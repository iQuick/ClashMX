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

## 账号
```
admin/admin
```

用户信息存在 api/data/auth 下


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

