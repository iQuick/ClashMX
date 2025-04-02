const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const execAsync = promisify(exec);


// 强制关闭占用端口的进程
async function killPort(port) {
  try {
    if (process.platform === 'win32') {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = stdout.split('\n');

      for (const line of lines) {
        const match = line.match(/(\d+)\s*$/);
        if (match) {
          const pid = match[1];
          if (pid == 0) {
            continue;
          }
          try {
            console.log(`尝试关闭进程 : taskkill /F /PID ${pid}`);
            await execAsync(`taskkill /F /PID ${pid}`);
            console.log(`已强制关闭端口 ${port} 的进程 (PID: ${pid})`);
          } catch (error) {
            // console.error(`关闭进程 ${pid} 失败:`, error.message);
          }
        }
      }
    } else {
      const { stdout } = await execAsync(`lsof -i :${port} -t`);
      const pids = stdout.trim().split('\n');

      for (const pid of pids) {
        try {
          await execAsync(`kill -9 ${pid}`);
          console.log(`已强制关闭端口 ${port} 的进程 (PID: ${pid})`);
        } catch (error) {
          console.error(`关闭进程 ${pid} 失败:`, error.message);
        }
      }
    }

    // 等待端口释放
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 再次检查端口是否已释放
    if (await checkPort(port)) {
      throw new Error(`端口 ${port} 仍然被占用`);
    }
  } catch (error) {
    console.error(`关闭端口 ${port} 的进程失败:`, error);
    throw error;
  }
}

// 等待服务启动
async function waitForService(host,port, timeout = 30000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(`http://${host}:${port}/api/health`);
      if (response.ok) {
        return true;
      }
    } catch (error) {
      // 服务还未启动，继续等待
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`等待服务启动超时 (${timeout}ms)`);
}


// 启动服务
async function startServices() {
  let config = { api: { host: '127.0.0.1', port: 3000 }, web: { host: '127.0.0.1', port: 8000 } }

  try {
    const configPath = path.join(__dirname, 'config.json');
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      config = JSON.parse(configContent);
    }
  } catch (error) {
    console.error('读取配置文件失败:', error);
  }

  for (const port of [config.api.port, config.web.port]) {
    try {
      await killPort(port);
    } catch (error) {
      console.error(`无法释放端口 ${port}，请手动关闭占用该端口的进程`);
      process.exit(1);
    }
  }

  // 启动API服务
  const apiProcess = spawn('node', ['api/index.js'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      CONFIG: JSON.stringify(config.api)
    }
  });

  // 等待API服务启动
  console.log('等待API服务启动...');
  try {
    await waitForService(config.api.host, config.api.port);
    console.log('API服务已启动');
  } catch (error) {
    console.error('API服务启动失败:', error);
    process.exit(1);
  }

  // 启动Web服务
  console.log('启动Web服务...');
  const webDir = path.join(__dirname, 'web');
  const webProcess = spawn('cmd', ['/c', 'npm', 'run', 'dev'], {
    cwd: webDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      API: JSON.stringify({ host: config.api.host, port: config.api.port }),
      CONFIG: JSON.stringify(config.web),
      PATH: process.env.PATH
    },
    shell: true,
    windowsHide: false
  });

  process.on('SIGKILL', () => {
    console.log('SIGKILL 信号接收');
    exit();
  });

  // 监听子进程错误
  apiProcess.on('error', (err) => {
    console.error('API服务启动失败:', err);
    console.error('错误详情:', err.message);
  });

  webProcess.on('error', (err) => {
    console.error('Web服务启动失败:', err);
    console.error('错误详情:', err.message);
  });

  // 监听子进程退出
  apiProcess.on('exit', (code) => {
    console.log(`API服务已退出，退出码: ${code}`);
  });

  webProcess.on('exit', (code) => {
    console.log(`Web服务已退出，退出码: ${code}`);
  });

  // 监听子进程输出
  apiProcess.stdout?.on('data', (data) => {
    console.log(`[API] ${data.toString().trim()}`);
  });

  webProcess.stdout?.on('data', (data) => {
    console.log(`[Web] ${data.toString().trim()}`);
  });

  apiProcess.stderr?.on('data', (data) => {
    console.error(`[API Error] ${data.toString().trim()}`);
  });

  webProcess.stderr?.on('data', (data) => {
    console.error(`[Web Error] ${data.toString().trim()}`);
  });

  
  // 处理进程退出
  const exit = () => {
    webProcess.kill();
    apiProcess.kill();
    process.exit();
  }

  // 监听 SIGINT 信号 (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('SIGINT 信号接收');
    exit();
  });

  // 监听 SIGTERM 信号
  process.on('SIGTERM', () => {
    console.log('SIGTERM 信号接收');
    exit();
  });

}

// 启动所有服务
startServices().catch(error => {
  console.error('启动服务失败:', error);
  process.exit(1);
}); 