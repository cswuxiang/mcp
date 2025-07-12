import { FastMCP } from 'fastmcp'
import { z } from 'zod' // Or any validation library that supports Standard Schema

const server = new FastMCP({
  name: 'My mpv server',
  version: '1.0.0',
})

server.addTool({
  name: 'add',
  description: 'Add two numbers',
  parameters: z.object({
    a: z.number(),
    b: z.number(),
  }),
  /**
	 * 异步执行加法运算并返回字符串结果
	 * @param {Object} args - 参数对象
	 * @param {number} args.a - 加数a
	 * @param {number} args.b - 加数b
	 * @returns {Promise<string>} 两数之和的字符串表示
	 */
  execute: async (args) => {
    console.log('Executing add tool with args:', args)
    return String(args.a + args.b)
  },
})


server.addTool({
  name: 'mpv-test',
  description: '查询mpv相关的内容',
  parameters: z.object({
    id: z.string(),
  }),
  /**
	 * 返回mpv相关的内容
	 * @param {Object} args - 参数对象
	 * @param {string} args.id - tapd的id
	 * @returns {Promise<string>} 返回tapd相关的内容
	 */
  execute: async (args) => {
    console.log('Executing mpv-test tool with args:', args)
    return `标准化/小型化】【集测测试】【CLS】 单Uin下最大可创建机器组数  限制问题单	${args.id}`
  },
})

// 添加一个资源，返回系统状态
server.addResource({
  uri: 'system://status',
  name: 'System Status',
  mimeType: 'text/plain',
  async load() {
    return {
      text: 'System operational',
    }
  },
})

/**
 * 获取系统状态的工具

 */
server.addTool({
  name: 'get_system_status',
  description: 'Get current system status',
  parameters: z.object({}),
  /**
	 * 执行下载文件操作并返回资源内容
	 * @async
	 * @param {Array} args - 执行参数
	 * @param {Object} context - 上下文对象
	 * @param {Function} context.log - 日志记录方法
	 * @returns {Promise<Object>} 返回包含资源内容的对象
	 */
  execute: async (args, { log }) => {
	  log.info('Downloaded file')
    console.log('Executing get_system_status tool with args:', args)
    return {
      content: [
        {
          type: 'resource',
          resource: await server.embedded('system://status'),
        },
      ],
    }
  },
})

server.start({
  transportType: 'httpStream',
  httpStream: {
    port: 8080,
  },
})