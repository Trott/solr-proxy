/// <reference types="node" resolution-mode="require"/>
import type { FastifyInstance } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'node:http';
declare const SolrProxy: {
    start: (port?: any, userOptions?: any) => Promise<FastifyInstance<Server, IncomingMessage, ServerResponse, import("fastify").FastifyLoggerInstance>>;
};
export default SolrProxy;
//# sourceMappingURL=index.d.ts.map