import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export interface CliToolInvocation {
    /**
     * The MCP server identifier (if provided by CLI).
     * When omitted, this bridge defaults to the local chrome MCP server.
     */
    server?: string;
    /**
     * The MCP tool name to invoke.
     */
    tool: string;
    /**
     * JSON-serializable arguments for the tool call.
     */
    args?: Record<string, unknown>;
}
export interface AgentToolBridgeOptions {
    /**
     * Base URL of the local MCP HTTP endpoint (e.g. http://127.0.0.1:12306/mcp).
     * If omitted, DEFAULT_SERVER_PORT from chrome-mcp-shared is used.
     */
    mcpUrl?: string;
}
/**
 * AgentToolBridge maps CLI tool events (Codex, etc.) to MCP tool calls
 * against the local chrome MCP server via the official MCP SDK client.
 *
 * 中文说明：该桥接层负责将 CLI 上报的工具调用统一转为标准 MCP CallTool 请求，
 * 复用现有 /mcp HTTP server，而不是在本项目内自研额外协议。
 */
export declare class AgentToolBridge {
    private readonly client;
    private readonly transport;
    constructor(options?: AgentToolBridgeOptions);
    /**
     * Connects the MCP client over Streamable HTTP if not already connected.
     */
    ensureConnected(): Promise<void>;
    /**
     * Invoke an MCP tool based on a CLI tool event.
     * Returns the raw result from MCP client.callTool().
     */
    callTool(invocation: CliToolInvocation): Promise<CallToolResult>;
}
