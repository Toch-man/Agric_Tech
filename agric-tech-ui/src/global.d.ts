// 1. Declare the module 'buffer' to bring in its contents
declare module "buffer" {
  export class Buffer extends Uint8Array {
    // ... (Buffer methods, which are auto-inferred from the import, but we need the class)
  }
}

// 2. Extend GlobalThis to include the Buffer type
declare global {
  interface GlobalThis {
    // Assign it the type of the Buffer class constructor
    Buffer: typeof import("buffer").Buffer;
  }
}

// 3. Keep the export to make the file a module
export {};
