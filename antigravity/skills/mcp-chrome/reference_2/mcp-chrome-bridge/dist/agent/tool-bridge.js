"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentToolBridge = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
const streamableHttp_js_1 = require("@modelcontextprotocol/sdk/client/streamableHttp.js");
const index_js_2 = require("../constant/index.js");
/**
 * AgentToolBridge maps CLI tool events (Codex, etc.) to MCP tool calls
 * against the local chrome MCP server via the official MCP SDK client.
 *
 * 中文说明：该桥接层负责将 CLI 上报的工具调用统一转为标准 MCP CallTool 请求，
 * 复用现有 /mcp HTTP server，而不是在本项目内自研额外协议。
 */
class AgentToolBridge {
    constructor(options = {}) {
        const url = options.mcpUrl || `http://127.0.0.1:${process.env.MCP_HTTP_PORT || index_js_2.NATIVE_SERVER_PORT}/mcp`;
        this.transport = new streamableHttp_js_1.StreamableHTTPClientTransport(new URL(url));
        this.client = new index_js_1.Client({
            name: 'chrome-mcp-agent-bridge',
            version: '1.0.0',
        }, {});
    }
    /**
     * Connects the MCP client over Streamable HTTP if not already connected.
     */
    async ensureConnected() {
        // Client.connect is idempotent; repeated calls reuse the same transport session.
        if (this.transport._sessionId) {
            return;
        }
        await this.client.connect(this.transport);
    }
    /**
     * Invoke an MCP tool based on a CLI tool event.
     * Returns the raw result from MCP client.callTool().
     */
    async callTool(invocation) {
        var _a;
        await this.ensureConnected();
        const args = (_a = invocation.args) !== null && _a !== void 0 ? _a : {};
        const result = await this.client.callTool({
            name: invocation.tool,
            arguments: args,
        });
        // The SDK returns a compatible structure; cast to satisfy strict typing.
        return result;
    }
}
exports.AgentToolBridge = AgentToolBridge;
//# sourceMappingURL=tool-bridge.js.map