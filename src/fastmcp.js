import { FastMCP } from "fastmcp";
import { z } from "zod"; // Or any validation library that supports Standard Schema

const server = new FastMCP({
	name: "My Server",
	version: "1.0.0",
});

server.addTool({
	name: "add",
	description: "Add two numbers",
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
		console.log("Executing add tool with args:", args);
		return String(args.a + args.b);
	},
});


server.addTool({
	name: "tap-test",
	description: "查询tapd相关的内容",
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
		console.log("Executing add tool with args:", args);
		return String(args.a + args.b);
	},
});

server.start({
	transportType: "httpStream",
  httpStream: {
    port: 8080,
  },
});