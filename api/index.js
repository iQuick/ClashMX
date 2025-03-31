const { extractFilename, parseYamlTemplate } = require('./utils');

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto'); // 引入crypto模块用于生成MD5

const { URL } = require('url');
const http = require('http');
const https = require('https');
const { error } = require('console');


const app = express();
const PORT = 3100;
const DATA_DIR = path.join(__dirname, 'data');
const AIRPORTS_DIR = path.join(DATA_DIR, 'airports'); // 机场数据目录
const RULE_TEMPLET_FILE =path.join(DATA_DIR,  "./rule_templet")
const MX_SUB_RULE_FILE = path.join(DATA_DIR, "./mx.yaml")

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  console.log(`创建数据目录: ${DATA_DIR}`);
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 确保机场数据目录存在
if (!fs.existsSync(AIRPORTS_DIR)) {
  console.log(`创建机场数据目录: ${AIRPORTS_DIR}`);
  fs.mkdirSync(AIRPORTS_DIR, { recursive: true });
}

// 中间件
app.use(cors());

// 先添加文本解析中间件，确保它的优先级高于JSON解析
app.use('/api/subscription', bodyParser.text({
  type: ['text/plain', 'application/json', '*/*'],
  limit: '10mb'
}));

// 再添加JSON解析中间件处理其他请求
app.use(bodyParser.json());

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log(`请求头Content-Type: ${req.headers['content-type']}`);
  next();
});

// 登录接口
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  try {
    // 检查 auth 文件是否存在
    const authFilePath = path.join(__dirname, 'data/auth');
    if (!fs.existsSync(authFilePath)) {
      // 创建默认用户数据
      const defaultAuthData = [
        {
          id: 1,
          username: 'admin',
          password: 'admin',
          role: 'admin'
        }
      ];
      
      // 确保 data 目录存在
      const dataDir = path.join(__dirname, 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // 写入默认用户数据
      fs.writeFileSync(authFilePath, JSON.stringify(defaultAuthData, null, 2));
      console.log('已创建默认用户数据文件');
    }
    
    // 读取用户数据
    const authData = JSON.parse(fs.readFileSync(authFilePath, 'utf8'));
    const user = authData.find(u => u.username === username && u.password === password);
    
    if (user) {
      // 生成一个简单的 token（实际应用中应该使用更安全的方式）
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      
      res.json({ 
        success: true, 
        data: { 
          token,
          user: { 
            id: user.id,
            username: user.username,
            role: user.role
          }
        }
      });
    } else {
      res.status(401).json({ 
        success: false, 
        error: '用户名或密码错误' 
      });
    }
  } catch (error) {
    console.error('登录处理失败:', error);
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    });
  }
});

// 生成机场文件ID (MD5哈希)
const generateAirportFileId = (name, url) => {
  const data = `${name}${url}`;
  return crypto.createHash('md5').update(data).digest('hex');
};

// 保存单个机场数据到文件
const saveAirportToFile = (airport) => {
  try {
    if (!airport.name || !airport.url) {
      console.error('机场数据缺少必要字段：name或url');
      return false;
    }
    
    // 使用机场名称和URL的MD5作为文件名
    const fileId = airport.id || generateAirportFileId(airport.name, airport.url);
    const filePath = path.join(AIRPORTS_DIR, `${fileId}.json`);
    
    // 确保id字段存在
    const airportData = { ...airport, id: fileId };
    
    console.log(`准备保存机场数据到文件: ${filePath}`);
    const fileContent = JSON.stringify(airportData, null, 2);
    
    fs.writeFileSync(filePath, fileContent);
    console.log(`机场数据已成功保存到: ${filePath}`);
    
    return { success: true, id: fileId };
  } catch (error) {
    console.error(`保存机场数据到文件失败:`, error);
    return { success: false, error: error.message };
  }
};

// 获取单个机场数据
const getAirportById = (id) => {
  try {
    const filePath = path.join(AIRPORTS_DIR, `${id}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`机场文件不存在: ${filePath}`);
      return null;
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    const airport = JSON.parse(data);
    
    return airport;
  } catch (error) {
    console.error(`获取机场数据失败:`, error);
    return null;
  }
};

// 删除单个机场数据
const deleteAirportById = (id) => {
  try {
    const filePath = path.join(AIRPORTS_DIR, `${id}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`机场文件不存在，无法删除: ${filePath}`);
      return false;
    }
    
    fs.unlinkSync(filePath);
    console.log(`机场文件已删除: ${filePath}`);
    
    return true;
  } catch (error) {
    console.error(`删除机场文件失败:`, error);
    return false;
  }
};

// 获取所有机场数据
const getAllAirports = () => {
  try {
    const files = fs.readdirSync(AIRPORTS_DIR);
    const airports = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(AIRPORTS_DIR, file);
        try {
          const data = fs.readFileSync(filePath, 'utf8');
          const airport = JSON.parse(data);
          airports.push(airport);
        } catch (error) {
          console.error(`读取机场文件 ${file} 失败:`, error);
        }
      }
    }
    
    return airports;
  } catch (error) {
    console.error(`获取所有机场数据失败:`, error);
    return [];
  }
};

// 保存数据到文件 (旧方法，保留兼容性)
const saveDataToFile = (filename, data) => {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    console.log(`准备保存数据到文件: ${filePath}`);
    console.log(`保存的数据类型: ${typeof data}, 是否为数组: ${Array.isArray(data)}`);
    
    let fileContent;
    // 特殊处理字符串类型的数据，确保正确写入JSON文件
    if (typeof data === 'string') {
      console.log('数据是字符串，特殊处理');
      // 尝试解析字符串为JSON对象
      try {
        const parsedData = JSON.parse(data);
        console.log('成功将字符串解析为JSON对象');
        // 如果解析成功，将解析后的对象转换为JSON字符串写入文件
        fileContent = JSON.stringify(parsedData, null, 2);
      } catch (parseError) {
        console.log('字符串不是有效的JSON，将直接保存字符串内容');
        // 如果不是有效JSON，将字符串直接转义后写入
        fileContent = JSON.stringify(data, null, 2);
      }
    } else {
      // 对象、数组等类型直接转换
      fileContent = JSON.stringify(data, null, 2);
    }
    
    console.log(`保存的数据内容预览: ${fileContent.substring(0, 200)}${fileContent.length > 200 ? '...' : ''}`);
    
    fs.writeFileSync(filePath, fileContent);
    
    console.log(`数据已成功保存到: ${filePath}, 数据长度: ${fileContent.length}`);
    return true;
  } catch (error) {
    console.error(`保存数据到文件 ${filename}.json 失败:`, error);
    return false;
  }
};

// 从文件读取数据 (旧方法，保留兼容性)
const readDataFromFile = (filename) => {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`文件不存在: ${filePath}, 将返回空数组`);
    return [];
  }
  
  try {
    console.log(`准备读取文件: ${filePath}`);
    const data = fs.readFileSync(filePath, 'utf8');
    
    console.log(`读取的原始数据: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
    
    const parsedData = JSON.parse(data);
    console.log(`成功解析文件: ${filePath}, 数据类型: ${typeof parsedData}, 是否为数组: ${Array.isArray(parsedData)}`);
    console.log(`数据长度: ${Array.isArray(parsedData) ? parsedData.length : '未知'}`);
    
    return parsedData;
  } catch (error) {
    console.error(`解析 ${filename}.json 失败:`, error);
    return [];
  }
};

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API 端点
// 获取所有机场数据
app.get('/api/airports', (req, res) => {
  console.log('收到获取所有机场数据请求');
  const airports = getAllAirports();
  console.log(`返回机场数据, 条数: ${airports.length}`);
  res.json(airports);
});

// 获取单个机场数据
app.get('/api/airports/:id', (req, res) => {
  const { id } = req.params;
  console.log(`收到获取单个机场数据请求, ID: ${id}`);
  
  const airport = getAirportById(id);
  
  if (!airport) {
    return res.status(404).json({ success: false, error: '机场不存在' });
  }
  
  res.json(airport);
});

// 新增: 更新mx.yaml的通用函数
const updateMxYaml = () => {
  try {
    console.log('开始更新mx.yaml...');
    
    // 读取订阅规则模板
    const templatePath = RULE_TEMPLET_FILE;
    if (!fs.existsSync(templatePath)) {
      console.error('订阅规则模板文件不存在:', templatePath);
      return false;
    }
    
    // 获取所有机场信息作为上下文
    const airports = getAllAirports();
    if (!airports || !Array.isArray(airports)) {
      console.error('获取机场信息失败或格式不正确');
      return false;
    }
    
    // 准备模板上下文
    const templateContext = {
      airports: airports
    };
    
    // 读取模板内容
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // 解析模板生成实际配置
    console.log('解析YAML模板');
    const parsedYaml = parseYamlTemplate(templateContent, templateContext);
    
    if (!parsedYaml) {
      console.error('解析YAML模板失败');
      return false;
    }
    
    // 保存到mx.yaml文件
    const outputPath = path.join(DATA_DIR, 'mx.yaml');
    fs.writeFileSync(outputPath, parsedYaml, 'utf8');
    console.log('成功更新mx.yaml文件');
    
    return true;
  } catch (error) {
    console.error('更新mx.yaml失败:', error);
    return false;
  }
};

// 保存/更新单个机场数据
app.post('/api/airports/single', (req, res) => {
  console.log('收到保存单个机场数据请求');
  console.log(`请求体类型: ${typeof req.body}`);
  
  try {
    const result = saveAirportToFile(req.body);
    
    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error || '保存失败' });
    }
    
    console.log(`保存机场数据成功, ID: ${result.id}`);
    
    // 机场信息已更新，自动更新mx.yaml
    updateMxYaml();
    
    res.json({ success: true, id: result.id });
  } catch (error) {
    console.error('保存机场数据时发生错误:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除单个机场数据
app.delete('/api/airports/:id', (req, res) => {
  const { id } = req.params;
  console.log(`收到删除机场数据请求, ID: ${id}`);
  
  const result = deleteAirportById(id);
  
  if (!result) {
    return res.status(404).json({ success: false, error: '删除失败，机场不存在或无法删除' });
  }
  
  // 机场信息已更新，自动更新mx.yaml
  updateMxYaml();
  
  res.json({ success: true });
});

// 批量保存机场数据 (旧API，保留兼容性)
app.post('/api/airports', (req, res) => {
  console.log('收到批量保存机场数据请求');
  console.log(`请求体类型: ${typeof req.body}, 是否为数组: ${Array.isArray(req.body)}`);
  
  // 如果是数组格式，逐个保存为单独的文件
  if (Array.isArray(req.body)) {
    console.log(`批量处理 ${req.body.length} 个机场数据`);
    
    const results = [];
    for (const airport of req.body) {
      const result = saveAirportToFile(airport);
      results.push(result);
    }
    
    const allSuccessful = results.every(r => r.success);
    
    if (allSuccessful) {
      console.log('所有机场数据保存成功');
      
      // 机场信息已更新，自动更新mx.yaml
      updateMxYaml();
      
      res.json({ success: true, count: results.length });
    } else {
      console.error('部分机场数据保存失败');
      res.status(500).json({ 
        success: false, 
        error: '部分数据保存失败',
        details: results.filter(r => !r.success)
      });
    }
  } else {
    console.error('请求体不是数组格式');
    res.status(400).json({ success: false, error: '数据格式错误，应为数组' });
  }
});


app.get("/api/airport-info", (req, res) => {
  try {
    // 检查URL是否为空
    const urlParam = req.query['url'];
    if (!urlParam) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL参数不能为空' 
      });
    }
    
    // 构建完整URL，确保它是有效的URL格式
    const url = urlParam.includes('?') ? `${urlParam}&flag=meta` : `${urlParam}?flag=meta`;
    console.log(`正在请求机场信息，URL: ${url}`);
    
    // 解析URL
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol;
    
    // 根据协议选择合适的模块
    const client = protocol === 'https:' ? https : http;
    
    // 发起请求
    const ureq = client.get(url, (response) => {
      const headers = response.headers;
      const data = {};
      
      // 从响应头中提取信息
      const disposition = headers["content-disposition"];
      if (disposition) {
        data["name"] = extractFilename(disposition);
      }
      
      const userinfo = headers["subscription-userinfo"];
      if (userinfo) {
        userinfo.split(";").forEach(v => {
          const kv = v.split("=");
          if (kv.length == 2) {
            data[kv[0].trim()] = Number(kv[1].trim());
          }
        });
      }
      
      res.status(200).json({ success: true, data });
    });
    
    // 处理数据事件
    ureq.on('data', (data) => {
      console.log('收到数据:', data.toString().substring(0, 100));
    });
    
    // 处理错误事件
    ureq.on('error', (err) => {
      console.error('请求机场信息失败:', err);
      res.status(200).json({ 
        success: false, 
        error: err.message 
      });
    });
    
    // 结束请求
    ureq.end();
  } catch (error) {
    console.error('处理机场信息请求失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 获取订阅规则
app.get('/api/subscription-rules', (req, res) => {
  const data = readDataFromFile('subscriptionRules') || [];
  res.json(data);
});

// 保存订阅规则
app.post('/api/subscription-rules', (req, res) => {
  try {
    saveDataToFile('subscriptionRules', req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving subscription rules:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取简单订阅规则
app.get('/api/subscription', (req, res) => {
  console.log('收到获取简单订阅规则请求');
  
  try {
    const filePath = RULE_TEMPLET_FILE;
    if (!fs.existsSync(filePath)) {
      console.log(`文件不存在: ${filePath}, 将返回空内容`);
      // 返回空字符串而不是JSON空对象
      return res.end('');
    }
    
    console.log(`准备读取文件: ${filePath}`);
    const data = fs.readFileSync(filePath, 'utf8');
    console.log(`读取的数据类型: ${typeof data}, 长度: ${data.length}`);
    console.log(`读取的内容: "${data.substring(0, 100)}${data.length > 100 ? '...' : ''}"`);
    
    // 处理空内容或空对象
    if (data.trim() === '' || data === '{}' || data === '[]') {
      console.log('文件内容为空或空对象，返回空字符串');
      return res.end('');
    }
    
    // 直接返回文件内容，不做解析
    console.log('发送原始文件内容');
    
    // 设置YAML内容类型
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    
    // 添加缓存控制头，避免浏览器缓存
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.end(data);
  } catch (error) {
    console.error('获取简单订阅规则失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 保存简单订阅规则
app.post('/api/subscription', (req, res) => {
  console.log('=======================================');
  console.log('收到保存简单订阅规则请求');
  console.log('请求头:', JSON.stringify(req.headers));
  console.log('请求体类型:', typeof req.body);
  
  try {
    // 检查请求体
    if (req.body === undefined || req.body === null) {
      console.error('请求体为空');
      return res.status(400).json({ success: false, error: '请求体不能为空' });
    }
    
    // 记录请求体内容摘要
    if (typeof req.body === 'string') {
      const preview = req.body.length > 100 ? req.body.substring(0, 100) + '...' : req.body;
      console.log('请求体内容预览:', preview);
      console.log('请求体长度:', req.body.length);
      
      // 判断是否是YAML格式
      const yamlLikePattern = /^(\s*[\w-]+\s*:\s*.+|(\s*-\s*.+))+$/m;
      const isLikelyYaml = yamlLikePattern.test(req.body);
      console.log('内容似乎是YAML格式:', isLikelyYaml);
    } else {
      console.log('请求体不是字符串:', typeof req.body);
    }
    
    // 直接写入，不经过任何处理或转换
    const filePath = RULE_TEMPLET_FILE;
    console.log(`准备写入文件: ${filePath}`);
    
    // 无条件直接写入原始内容
    fs.writeFileSync(filePath, req.body, 'utf8');
    
    // 验证写入结果
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      console.log('文件写入后长度:', content.length);
      
      if (content !== req.body) {
        console.error('警告: 写入内容与请求内容不同!');
        console.log('差异:', content === req.body ? '无' : '有差异');
      }
    }
    
    console.log('文件写入完成');
    
    // 订阅规则已更新，自动更新mx.yaml
    updateMxYaml();
    
    console.log('=======================================');
    
    res.json({ success: true });
  } catch (error) {
    console.error('保存简单订阅规则失败:', error);
    console.error('错误详情:', error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 订阅地址 - 返回YAML格式的订阅规则
app.get('/api/mx.yaml', (req, res) => {
  console.log('收到订阅地址请求');
      
  try {
    const filePath = path.join(DATA_DIR, 'mx.yaml');
    
    if (!fs.existsSync(filePath)) {
      if (!fs.existsSync(RULE_TEMPLET_FILE)) {
        // 订阅文件 和 模板文件同时不存在，则
        return res.status(404).send("");
      }

      updateMxYaml()
    }
    
    console.log(`准备读取文件: ${filePath}`);
    const content = fs.readFileSync(filePath, { encoding: 'utf8' });
    console.log(`读取的数据长度: ${content.length}`);
    
    // 设置为text/plain而不是application/x-yaml，让浏览器能够显示内容而不是下载
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    
    // 添加缓存控制头，避免浏览器缓存
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // 使用Buffer.from确保正确的UTF-8编码
    res.end(Buffer.from(content, 'utf8'));
  } catch (error) {
    console.error('获取YAML订阅规则失败:', error);
    res.status(500).send('服务器内部错误');
  }
});


// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('API服务错误:', err);
  res.status(500).json({ success: false, error: err.message });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`API服务已启动，端口: ${PORT}`);
  console.log(`数据存储目录: ${DATA_DIR}`);
  console.log(`机场数据目录: ${AIRPORTS_DIR}`);
}); 