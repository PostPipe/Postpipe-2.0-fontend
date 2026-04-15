// src/lib/rbac/index.ts  — single import surface for RBAC

export * from "./types";
export * from "./permissions";
export { RBACProvider, useRBAC, Can } from "./RBACContext";
export * from "./schemaGenerators";