import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: '../server/swagger.json',
    output: {
      mode: 'tags-split',
      target: './app/shared/api/endpoints',
      schemas: './app/shared/api/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: {
        mutator: {
          path: './app/shared/api/http-client.ts',
          name: 'httpRequest',
        },
      },
    },
  },
});
