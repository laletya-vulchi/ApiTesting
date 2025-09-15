const { defineConfig } = require('cypress');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');
const createEsbuildPlugin =
    require('@badeball/cypress-cucumber-preprocessor/esbuild').createEsbuildPlugin;

module.exports = defineConfig({
    viewportWidth: 1280,
    viewportHeight: 720,
    e2e: {
        baseUrl: 'https://conduit.bondaracademy.com/',
        async setupNodeEvents(on, config) {
            await addCucumberPreprocessorPlugin(on, config);

            on(
                'file:preprocessor',
                createBundler({
                    plugins: [createEsbuildPlugin(config)],
                }),
            );

            return config;
        },
        specPattern: 'cypress/e2e/bddTesting/*.feature',
        env: {
            email: 'laletyav@apitest.com',
            password: 'Elastic+123',
            username: 'laletyav',
            apiUrl: 'https://conduit-api.bondaracademy.com/api',
        },
    },
});
