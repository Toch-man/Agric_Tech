// src/global.d.ts

// Tell TypeScript that the Buffer type should be available globally.
import { Buffer } from "buffer";

declare global {
  interface GlobalThis {
    // Add the Buffer property to globalThis and assign it the correct Buffer type.
    Buffer: typeof Buffer;
  }
}

// If this file is a module (has an import/export), this ensures it is treated globally.
export {};
