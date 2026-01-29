// Fixed: Removed missing vite/client reference to resolve 'Cannot find type definition file' error.
// The necessary ImportMeta definitions are declared below.

declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
  }
}

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
