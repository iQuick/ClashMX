/**
 * 生成字符串的MD5哈希值 (在浏览器环境中)
 * 
 * 注意：这个函数使用的是简化版的哈希算法，仅用于生成基本的哈希ID
 * 实际MD5算法更复杂，但此简化版足够满足基本需求
 * 
 * @param input 需要哈希的字符串
 * @returns 哈希字符串
 */
export function generateMD5(input: string): string {
  // 使用Web Crypto API的SubtleCrypto接口生成哈希值
  // 由于我们在客户端不能直接使用Node.js的crypto模块，这里使用简化版的哈希方法
  
  // 将输入转换为UTF-8编码的Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  
  // 简化版的哈希生成 (不是真正的MD5，但足够作为简单的文件ID使用)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data[i];
    hash |= 0; // 转换为32位整数
  }

  // 确保结果为正数并转换为16进制
  const positiveHash = Math.abs(hash);
  const hex = positiveHash.toString(16).padStart(8, '0');
  
  // 扩展哈希长度到32位 (类似MD5)
  return Array(4).fill(hex).join('');
}

/**
 * 为机场数据生成唯一ID
 * 
 * @param name 机场名称
 * @param url 订阅URL
 * @returns 基于名称和URL的唯一标识符
 */
export function generateAirportId(name: string, url: string): string {
  return generateMD5(`${name}${url}`);
} 