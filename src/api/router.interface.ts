import type { IApiRegistry } from "./api-registry";

/**
 * Top-level API router — maps HTTP methods + paths to resource APIs.
 * Implemented by Next.js app router wrappers in Phase 3.
 */
export interface IApiRouter {
  readonly resources: IApiRegistry;
}
