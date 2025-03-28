const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const process = require('process');

// 获取当前工作目录
const cwd = process.cwd();
const apiDir = path.join(cwd, 'api');
const webDir = path.join(cwd, 'web');

// 检查API目录和依赖
console.log('检查API服务依赖...');
if (!fs.existsSync(path.join(apiDir, 'node_modules'))) {
  console.log('正在安装API服务依赖...');
  try {
    execSync('npm install', {
      cwd: apiDir,
      stdio: 'inherit'
    });
    console.log('API服务依赖安装完成');
  } catch (error) {
    console.error('API服务依赖安装失败:', error.message);
    process.exit(1);
  }
}

// 确保API服务数据目录存在
const dataDir = path.join(apiDir, 'data');
if (!fs.existsSync(dataDir)) {
  console.log('创建API服务数据目录...');
  fs.mkdirSync(dataDir, { recursive: true });
}

// 启动API服务器
console.log('正在启动API服务器...');
const apiServer = spawn('npm', ['start'], {
  cwd: apiDir,
  shell: true,
  stdio: 'pipe'
});

apiServer.stdout.on('data', (data) => {
  console.log(`[API] ${data.toString().trim()}`);
});

apiServer.stderr.on('data', (data) => {
  console.error(`[API ERROR] ${data.toString().trim()}`);
});

// 等待API服务器启动
setTimeout(() => {
  // 启动前端开发服务器
  console.log('正在启动前端服务...');
  const frontendServer = spawn('npm', ['run', 'dev'], {
    cwd: webDir,
    shell: true,
    stdio: 'pipe'
  });

  frontendServer.stdout.on('data', (data) => {
    console.log(`[前端] ${data.toString().trim()}`);
  });

  frontendServer.stderr.on('data', (data) => {
    console.error(`[前端错误] ${data.toString().trim()}`);
  });

  // 处理进程退出
  process.on('SIGINT', () => {
    console.log('正在关闭所有服务...');
    apiServer.kill();
    frontendServer.kill();
    process.exit(0);
  });
}, 3000); // 给API服务器3秒钟启动时间

console.log('服务正在启动中，请等待...');
console.log('按 Ctrl+C 可以同时停止所有服务'); 