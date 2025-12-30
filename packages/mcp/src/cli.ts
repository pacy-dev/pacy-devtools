#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import WebSocket from 'ws';

import { readPortConfig } from './global.js';

const sendWebsocketMessage = async (message: {
  type: string;
  task_number: number;
  summary: string;
  step_type: string;
}): Promise<{ result: 'success' } | { result: 'error'; error: string }> => {
  const port = readPortConfig();

  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(`ws://localhost:${port}`);

      ws.onopen = () => {
        ws.send(JSON.stringify(message));
        ws.close();
        resolve({ result: 'success' });
      };

      ws.onerror = () => {
        resolve({ result: 'error', error: 'No bridge server running on port ' + port });
      };

      ws.onclose = (event) => {
        if (event.code !== 1000) {
          resolve({ result: 'error', error: 'WebSocket connection closed unexpectedly' });
        }
      };
    } catch (error) {
      resolve({ result: 'error', error: error instanceof Error ? error.message : String(error) });
    }
  });
};

class PacyDevtoolsServer {
  private server: Server;
  private ws: WebSocket | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'pacy-mcp-server',
        version: '0.1.18',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupToolHandlers();

    this.server.onerror = (error) => console.error('[MCP Error]', error);
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'task_update',
          description:
            'If the user mentions /pacy in the beginning of the prompt, use this tool. This is extremely crucial. ' +
            'First, execute this tool immediately after the prompt is received, with the "step_type": "start". ' +
            'Then, execute this tool with the "step_type": "update" BEFORE each step, such as each file creation, modification, fixing errors, running terminal commands, etc. ' +
            'Importantly, execute this tool lastly with the "step_type": "end" before the task is finished. ' +
            'This one is extremely crucial too. You should call this tool before attempting completion of the task.',
          inputSchema: {
            type: 'object',
            properties: {
              task_number: {
                type: 'number',
                description: 'The number that follows /pacy text',
              },
              step_type: {
                type: 'string',
                description: 'The type of the current step',
                enum: ['start', 'update', 'end'],
              },
              summary: {
                type: 'string',
                description:
                  'A short summary of the current step. Do not mention the task number in the summary. ',
              },
            },
            required: ['task_number', 'step_type', 'summary'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'task_update') {
        const { step_type, summary, task_number } = request.params.arguments as {
          task_number: number;
          step_type: 'start' | 'update' | 'end';
          summary: string;
        };

        if (typeof task_number !== 'number') {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Invalid arguments: task number must be a number',
          );
        }

        if (typeof summary !== 'string') {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Invalid arguments: summary must be a string',
          );
        }

        if (!['start', 'update', 'end'].includes(step_type)) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Invalid arguments: step_type must be "start", "update", or "end"',
          );
        }

        const result = await sendWebsocketMessage({
          type: 'task_update',
          task_number,
          summary,
          step_type,
        });

        if (result.result === 'error') {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to send task update: ${result.error}`,
          );
        }

        return {
          content: [
            {
              type: 'text',
              text: 'Task update sent successfully',
            },
          ],
        };
      }

      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP server running on stdio');
  }
}

const server = new PacyDevtoolsServer();
server.run().catch(console.error);
