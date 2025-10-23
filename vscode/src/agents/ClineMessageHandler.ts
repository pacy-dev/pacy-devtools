import chalk from 'chalk';
import * as vscode from 'vscode';

export interface ClineAPI {
  /**
   * Set custom instructions for Claude
   * @param instructions The custom instructions to set
   */
  setCustomInstructions(instructions: string): Promise<void>;

  /**
   * Get the current custom instructions
   * @returns The current custom instructions
   */
  getCustomInstructions(): Promise<string>;

  /**
   * Start a new task with an initial message
   * @param message The initial message to send
   * @param images Optional array of base64-encoded images to send
   */
  startNewTask(message: string, images?: string[]): Promise<void>;

  /**
   * Send a message to the current task
   * @param message The message to send
   */
  sendMessage(message: string): Promise<void>;

  /**
   * Simulate pressing the primary button in the chat interface
   */
  pressPrimaryButton(): Promise<void>;

  /**
   * Simulate pressing the secondary button in the chat interface
   */
  pressSecondaryButton(): Promise<void>;
}

export interface ClineSendMessageMessage {
  type: typeof SYSTEM_MESSAGES.CLINE_SEND_MESSAGE;
  targetInstance: string;
  message: string;
}

export interface ClineStartTaskMessage {
  type: typeof SYSTEM_MESSAGES.CLINE_START_TASK;
  targetInstance: string;
  message: string;
  images?: string[];
}

// Message types for system messages
export const SYSTEM_MESSAGES = {
  CLINE_START_TASK: 'cline_start_task',
  CLINE_SEND_MESSAGE: 'cline_send_message',

  ROOCODE_START_TASK: 'roocode_start_task',
  ROOCODE_SEND_MESSAGE: 'roocode_send_message',

  // Response messages
  CLINE_ERROR_RESPONSE: 'cline_error_response',
  CLINE_SUCCESS_RESPONSE: 'cline_success_response',
} as const;

export function clineLikeInactivityMessage(displayName: string) {
  return `The extension is not found. Please install ${displayName} extension to use this feature.`;
}

export class ClineMessageHandler {
  isRoocode = false;
  messageTypes: {
    START_TASK: string;
    SEND_MESSAGE: string;
  };

  constructor(options: { isRoocode?: boolean } = {}) {
    this.isRoocode = options.isRoocode || false;
    this.messageTypes = this.isRoocode
      ? {
          START_TASK: SYSTEM_MESSAGES.ROOCODE_START_TASK,
          SEND_MESSAGE: SYSTEM_MESSAGES.ROOCODE_SEND_MESSAGE,
        }
      : {
          START_TASK: SYSTEM_MESSAGES.CLINE_START_TASK,
          SEND_MESSAGE: SYSTEM_MESSAGES.CLINE_SEND_MESSAGE,
        };
  }

  async handleMessage(message: any, sendMessage: (message: any) => void) {
    try {
      const clineExtension = vscode.extensions.getExtension<ClineAPI>(
        this.isRoocode ? 'rooveterinaryinc.roo-cline' : 'saoudrizwan.claude-dev',
      );

      if (!clineExtension) {
        console.log(chalk.red('Cline extension is not found'));
        vscode.window.showWarningMessage(
          clineLikeInactivityMessage(`${this.isRoocode ? 'RooCode' : 'Cline'}`),
        );
        sendMessage({
          type: SYSTEM_MESSAGES.CLINE_ERROR_RESPONSE,
          error: `${this.isRoocode ? 'RooCode' : 'Cline'} extension is not found`,
        });

        return;
      }

      if (!clineExtension.isActive) {
        console.log(chalk.red('Cline extension is not active'));
        // Execute the focus command based on which extension we're using
        // await vscode.commands.executeCommand(
        //   this.isRoocode ? 'roo-cline.focusInput' : 'cline.focusChatInput',
        // );

        // console.log(
        //   `Focused the ${this.isRoocode ? 'RooCode' : 'Cline'} input manually by a command`,
        // );

        // Wait for 500ms to ensure the input is focused
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const cline = clineExtension.exports;

      if (!cline) {
        console.log(chalk.red('Cline API is not available'));
        vscode.window.showWarningMessage(
          clineLikeInactivityMessage(`${this.isRoocode ? 'RooCode' : 'Cline'}`),
        );

        sendMessage({
          type: SYSTEM_MESSAGES.CLINE_ERROR_RESPONSE,
          error: `${this.isRoocode ? 'RooCode' : 'Cline'} API is not available`,
        });

        return;
      }

      switch (message.type) {
        case this.messageTypes.START_TASK: {
          // await vscode.commands.executeCommand(
          //   this.isRoocode ? 'roo-cline.focusInput' : 'cline.focusChatInput',
          // );

          await new Promise((resolve) => setTimeout(resolve, 500));

          const msg = message as ClineStartTaskMessage;
          await cline.startNewTask(msg.message, msg.images);
          sendMessage({ type: SYSTEM_MESSAGES.CLINE_SUCCESS_RESPONSE });
          break;
        }
        case this.messageTypes.SEND_MESSAGE: {
          // await vscode.commands.executeCommand(
          //   this.isRoocode ? 'roo-cline.focusInput' : 'cline.focusChatInput',
          // );

          const msg = message as ClineSendMessageMessage;
          await cline.sendMessage(msg.message);
          sendMessage({ type: SYSTEM_MESSAGES.CLINE_SUCCESS_RESPONSE });
          break;
        }
      }
    } catch (error) {
      sendMessage({
        type: SYSTEM_MESSAGES.CLINE_ERROR_RESPONSE,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }
}
