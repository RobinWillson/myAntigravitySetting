import type { AgentEngine, EngineExecutionContext, EngineInitOptions } from './types';
import { AgentToolBridge } from '../tool-bridge';
/**
 * CodexEngine integrates the Codex CLI as an AgentEngine implementation.
 *
 * The implementation is intentionally self-contained and does not persist messages;
 * it focuses on streaming Codex JSON events into RealtimeEvent envelopes that the
 * sidepanel UI can consume.
 *
 * 中文说明：该引擎基于 other/cweb 中 Codex 适配器的事件协议，完整处理
 * item.started/item.delta/item.completed/item.failed/error 等事件，并
 * 通过 AgentStreamManager 将编码后的 RealtimeEvent 推送给 sidepanel，
 * 确保数据链路「Sidepanel → Native Server → Codex CLI → Sidepanel」闭环。
 */
export declare class CodexEngine implements AgentEngine {
    readonly name: "codex";
    readonly supportsMcp = false;
    private readonly toolBridge;
    constructor(toolBridge?: AgentToolBridge);
    /**
     * Maximum number of stderr lines to keep in memory to avoid unbounded growth.
     */
    private static readonly MAX_STDERR_LINES;
    initializeAndRun(options: EngineInitOptions, ctx: EngineExecutionContext): Promise<void>;
    private resolveRepoPath;
    /**
     * Append project context (file listing) to the prompt.
     * Aligned with other/cweb implementation.
     */
    private appendProjectContext;
    /**
     * Build Codex CLI configuration arguments from the resolved config.
     * Aligned with other/cweb implementation for feature parity.
     */
    private buildCodexConfigArgs;
    /**
     * Write an attachment to a temporary file and return its path.
     */
    private writeAttachmentToTemp;
    private buildCodexEnv;
    private pickFirstString;
    private summarizeApplyPatch;
    private extractTodoListItems;
    private normalizeTodoListItems;
    private buildTodoListContent;
    private createTodoListMetadata;
    private encodeHash;
}
