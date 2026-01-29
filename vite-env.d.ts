
/**
 * Fix: Removed 'vite/client' reference to resolve "Cannot find type definition file for 'vite/client'".
 * Manual definitions for ImportMetaEnv and ImportMeta are provided to support Vite's environment variables.
 */
interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Fix: Augment the NodeJS namespace to include API_KEY in ProcessEnv.
 * This approach avoids redeclaring the 'process' variable directly, which 
 * resolves the "Cannot redeclare block-scoped variable 'process'" error 
 * that occurs if 'process' is already defined in the global scope 
 * (e.g., from Node.js types or environment configurations).
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY: string;
      [key: string]: string | undefined;
    }
  }
}

export {};
