const { Liquid } = require('liquidjs');

/**
 * 解析YAML模板
 * @param template YAML模板
 * @param context 上下文信息
 * @returns 解析后的YAML内容
 */
function parseYamlTemplate(template, context) {
  try {
    // 创建Liquid引擎实例
    const engine = new Liquid({
      strictFilters: true,
      strictVariables: false,
      trimTagRight: false,
      trimTagLeft: false,
      ownPropertyOnly: true
    });

    // 使用Liquid解析模板
    return engine.parseAndRenderSync(template, context)
  } catch (error) {
    console.error('YAML模板解析错误:', error);
    return '';
  }
}


/**
 * 从content-disposition头中提取filename
 * @param disposition content-disposition头的值
 * @returns 解码后的文件名，如果未找到则返回null
 */
function extractFilename(disposition) {
    if (!disposition) return null;
  
    // 尝试匹配标准格式 filename="xxx"
    const standardMatch = disposition.match(/filename="([^"]+)"/);
    if (standardMatch) {
      return standardMatch[1];
    }
  
    // 尝试匹配URL编码格式 filename*=UTF-8''xxx
    const encodedMatch = disposition.match(/filename\*=UTF-8''([^;]+)/);
    if (encodedMatch) {
      try {
        return decodeURIComponent(encodedMatch[1]);
      } catch (e) {
        console.error('解码文件名失败:', e);
        return null;
      }
    }
  
    return null;
  }

  module.exports = { extractFilename, parseYamlTemplate };
