/// <reference types="node" resolution-mode="require"/>
import type { FastifyInstance } from 'fastify';
import { IncomingMessage, ServerResponse } from 'node:http';
declare const SolrProxy: {
    start: (port?: any, userOptions?: any) => Promise<FastifyInstance<import("fastify").RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, import("fastify").FastifyBaseLogger, import("fastify").FastifyTypeProviderDefault>>;
};
export default SolrProxy;
//# sourceMappingURL=index.d.ts.map