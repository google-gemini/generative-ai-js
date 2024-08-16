import { esbuildPlugin } from "@web/dev-server-esbuild";

// eslint-disable-next-line import/no-default-export
export default {
  files: ["test-integration/web/*.test.ts"],
  plugins: [esbuildPlugin({ ts: true })],
  nodeResolve: true,
  testFramework: {
    config: {
      timeout: 10000,
      retries: 0,
    },
  },
  testRunnerHtml: (testFramework) =>
    `<html>
      <body>
        <script>window.process = { env: { GEMINI_API_KEY: "${process.env.GEMINI_API_KEY}" } }</script>
        <script type="module" src="${testFramework}"></script>
      </body>
    </html>`,
};
