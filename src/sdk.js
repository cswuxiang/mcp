const { Server, StdioTransport } = require('@modelcontextprotocol/server');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// 1. 创建MCP服务器实例
const server = new Server('weather-server');

// 2. 设置安全验证（可选）
server.use((request, next) => {
	// 简单的Bearer Token验证
	const token = request.metadata?.authorization?.split(' ')[1];
	try {
		jwt.verify(token, process.env.SECRET_KEY || 'your-secret-key');
		return next(request);
	} catch (error) {
		return { status: 'error', code: 'UNAUTHORIZED', message: 'Invalid token' };
	}
});

// 3. 注册工具 - 天气查询
server.registerTool({
	name: 'get_weather',
	description: '获取城市天气预报',
	inputSchema: {
		type: 'object',
		properties: {
			city: { type: 'string', description: '城市名称' },
			days: {
				type: 'integer',
				description: '预报天数',
				default: 1,
				minimum: 1,
				maximum: 7
			}
		},
		required: ['city']
	},
	handler: async ({ city, days = 1 }) => {
		try {
			// 调用天气API
			const response = await axios.get(
				`https://api.weatherapi.com/v1/forecast.json?key=YOUR_API_KEY&q=${city}&days=${days}`
			);

			// 提取所需数据
			const forecast = response.data.forecast.forecastday.slice(0, days).map(day => ({
				date: day.date,
				max_temp: day.day.maxtemp_c,
				min_temp: day.day.mintemp_c,
				condition: day.day.condition.text
			}));

			return {
				status: 'success',
				data: {
					location: response.data.location.name,
					current_temp: response.data.current.temp_c,
					forecast
				}
			};
		} catch (error) {
			return {
				status: 'error',
				code: 'API_FAILURE',
				message: '天气服务不可用，请稍后重试'
			};
		}
	}
});

// 4. 注册工具 - 数学计算
server.registerTool({
	name: 'calculate',
	description: '执行数学运算',
	inputSchema: {
		type: 'object',
		properties: {
			expression: { type: 'string', description: '数学表达式，如: 2+3 * 4' }
		},
		required: ['expression']
	},
	handler: async ({ expression }) => {
		try {
			// 使用安全表达式求值
			const result = evaluateMathExpression(expression);
			return { status: 'success', result };
		} catch (error) {
			return {
				status: 'error',
				code: 'INVALID_EXPRESSION',
				message: '无效的数学表达式'
			};
		}
	}
});

// 5. 数学表达式安全求值（避免使用eval）
function evaluateMathExpression(expr) {
	const sanitized = expr.replace(/[^0-9+\-*/(). ]/g, '');

	// 使用更安全的方法计算
	const tokens = sanitized.match(/(?:\d+\.?\d*|\.\d+)|[+\-*/()]/g) || [];

	// 创建函数计算更安全（实际项目使用专用库如math.js）
	return Function(`"use strict"; return (${tokens.join('')})`)();
}

// 6. 启动服务器（使用Stdio传输）
(async () => {
	try {
		const stdio = new StdioTransport();
		await server.listen(stdio);
		console.log('✅ MCP服务器已启动，等待连接...');
	} catch (error) {
		console.error('❗ 服务器启动失败:', error);
		process.exit(1);
	}
})();

// 7. 模拟客户端调用（测试用）
// async function testCall() {
// 	console.log('\n=== 测试天气查询 ===');
// 	const weatherResponse = await server.tools.get_weather.handler({
// 		city: 'Beijing',
// 		days: 2
// 	});
// 	console.log(weatherResponse);

// 	console.log('\n=== 测试数学计算 ===');
// 	const mathResponse = await server.tools.calculate.handler({
// 		expression: '3 + (12.5 * 4 - 10)/2'
// 	});
// 	console.log(mathResponse);
// }

// 取消注释进行测试
// testCall();