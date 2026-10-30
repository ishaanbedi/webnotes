import { defineConfig } from "@neon/config/v1";

// Declares the private bucket used for note images. Provision with `neon deploy`.
export default defineConfig({
  buckets: {
    uploads: {},
  },
});
