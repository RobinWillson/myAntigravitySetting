#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
export declare const getStdioMcpServer: () => Server<{
    method: string;
    params?: {
        [x: string]: unknown;
        task?: {
            [x: string]: unknown;
            ttl?: number | null | undefined;
            pollInterval?: number | undefined;
        } | undefined;
        _meta?: {
            [x: string]: unknown;
            progressToken?: string | number | undefined;
            "io.modelcontextprotocol/related-task"?: {
                [x: string]: unknown;
                taskId: string;
            } | undefined;
        } | undefined;
    } | undefined;
}, {
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
            "io.modelcontextprotocol/related-task"?: {
                [x: string]: unknown;
                taskId: string;
            } | undefined;
        } | undefined;
    } | undefined;
}, {
    [x: string]: unknown;
    _meta?: {
        [x: string]: unknown;
        "io.modelcontextprotocol/related-task"?: {
            [x: string]: unknown;
            taskId: string;
        } | undefined;
    } | undefined;
}>;
export declare const ensureMcpClient: () => Promise<Client<{
    method: string;
    params?: {
        [x: string]: unknown;
        task?: {
            [x: string]: unknown;
            ttl?: number | null | undefined;
            pollInterval?: number | undefined;
        } | undefined;
        _meta?: {
            [x: string]: unknown;
            progressToken?: string | number | undefined;
            "io.modelcontextprotocol/related-task"?: {
                [x: string]: unknown;
                taskId: string;
            } | undefined;
        } | undefined;
    } | undefined;
}, {
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
            "io.modelcontextprotocol/related-task"?: {
                [x: string]: unknown;
                taskId: string;
            } | undefined;
        } | undefined;
    } | undefined;
}, {
    [x: string]: unknown;
    _meta?: {
        [x: string]: unknown;
        "io.modelcontextprotocol/related-task"?: {
            [x: string]: unknown;
            taskId: string;
        } | undefined;
    } | undefined;
}> | undefined>;
export declare const setupTools: (server: Server) => void;
