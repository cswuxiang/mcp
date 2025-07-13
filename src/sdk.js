import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import fetch from 'node-fetch'

// Create an MCP server
const server = new McpServer({
  name: 'sdk-mcp-server',
  version: '1.0.0'
})

// Add an addition tool
server.registerTool('add',
  {
    title: 'Addition Tool',
    description: 'Add two numbers',
    inputSchema: { a: z.number(), b: z.number() }
  },
  async ({ a, b }) => ({
    content: [{ type: 'text', text: String(a + b) }]
  })
)

// Add a dynamic greeting resource
server.registerResource(
  'greeting',
  new ResourceTemplate('greeting://{name}', { list: undefined }),
  { 
    title: 'Greeting Resource',      // Display name for UI
    description: 'Dynamic greeting generator'
  },
  async (uri, { name }) => ({
    contents: [{
      uri: uri.href,
      text: `Hello, ${name}!`
    }]
  })
)

// Async tool with external API call
server.registerTool(
  'fetch-weather',
  {
    title: 'Weather Fetcher',
    description: 'Get weather data for a city',
    inputSchema: { city: z.string() }
  },
  async ({ city }) => {
    const response = await fetch(`https://api.weather.com/${city}`)
    const data = await response.text()
    return {
      content: [{ type: 'text', text: data }]
    }
  }
)

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport()
server.connect(transport)