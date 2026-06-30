import type { AgentActRequest } from './types';
import type { AgentEngine, EngineName, RunningExecution } from './engines/types';
import { AgentStreamManager } from './stream-manager';
export interface AgentChatServiceOptions {
    engines: AgentEngine[];
    streamManager: AgentStreamManager;
    defaultEngineName?: EngineName;
}
/**
 * AgentChatService coordinates incoming /agent/chat requests and delegates to engines.
 *
 * 中文说明：该服务负责会话级调度，不关心具体 CLI/SDK 实现细节。
 * 通过 Engine 接口实现依赖倒置，后续替换或新增引擎时无需修改 HTTP 路由层。
 */
export declare class AgentChatService {
    private readonly engines;
    private readonly streamManager;
    private readonly defaultEngineName;
    /**
     * Registry of currently running executions, keyed by requestId.
     */
    private readonly runningExecutions;
    constructor(options: AgentChatServiceOptions);
    handleAct(sessionId: string, payload: AgentActRequest): Promise<{
        requestId: string;
    }>;
    /**
     * Cancel a running execution by requestId.
     * Returns true if the execution was found and cancelled, false otherwise.
     */
    cancelExecution(requestId: string): boolean;
    /**
     * Cancel all running executions for a session.
     * Returns the number of executions cancelled.
     */
    cancelSessionExecutions(sessionId: string): number;
    /**
     * Get list of running executions for diagnostics.
     */
    getRunningExecutions(): RunningExecution[];
    private resolveEngineName;
    private runEngine;
    /**
     * Expose registered engines for UI and diagnostics.
     */
    getEngineInfos(): Array<{
        name: EngineName;
        supportsMcp?: boolean;
    }>;
}
