import { defineConfig } from "cypress";

export default defineConfig({
  viewportWidth: 1280,
  viewportHeight: 720,
  e2e: {
    baseUrl: 'https://conduit.bondaracademy.com/',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      email: 'laletyav@apitest.com',
      password: 'Elastic+123',
      username: 'laletyav'
    }
  },
});
