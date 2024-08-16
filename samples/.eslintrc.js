/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  plugins: [
    "import",
    "unused-imports",
  ],
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: "module"
  },
  overrides: [
    {
      files: ["**/*.test.ts", "**/{test,testing}/**/*.ts"],
      rules: {
        // TODO: Use https://www.npmjs.com/package/eslint-plugin-chai-friendly instead
        "no-unused-expressions": "off",
      },
    },
  ],
  ignorePatterns: ["dist/", ".eslintrc.js"],
  rules: {
    curly: ["error", "all"],
    "guard-for-in": "error",
    "no-extra-label": "error",
    "no-unused-labels": "error",
    "new-parens": "error",
    "no-new-wrappers": "error",
    "no-debugger": "error",
    "no-duplicate-case": "error",
    "no-throw-literal": "error",
    "no-return-await": "error",
    "no-unsafe-finally": "error",
    "no-unused-expressions": [
      "error",
      {
        allowShortCircuit: true,
      },
    ],
    "no-var": "error",
    "object-shorthand": "error",
    "prefer-arrow-callback": [
      "error",
      {
        allowNamedFunctions: true,
      },
    ],
    "prefer-const": [
      "error",
      {
        destructuring: "all",
      },
    ],
    radix: "error",
    "unused-imports/no-unused-imports-ts": "error",
    "default-case": "error",
    eqeqeq: [
      "error",
      "always",
      {
        null: "ignore",
      },
    ],
    "no-caller": "error",
    "no-cond-assign": ["error", "always"],
    "use-isnan": "error",
    "constructor-super": "error",
    "no-restricted-properties": [
      "error",
      {
        object: "it",
        property: "skip",
      },
      {
        object: "it",
        property: "only",
      },
      {
        object: "describe",
        property: "skip",
      },
      {
        object: "describe",
        property: "only",
      },
      {
        object: "xit",
      },
    ],
    "no-restricted-globals": [
      "error",
      { name: "xit" },
      { name: "xdescribe" },
      { name: "parseInt", message: "tsstyle#type-coercion" },
      { name: "parseFloat", message: "tsstyle#type-coercion" },
    ],
    "no-array-constructor": "error",
    "sort-imports": [
      "error",
      {
        ignoreCase: false,
        ignoreDeclarationSort: true, // don't want to sort import lines, use eslint-plugin-import instead
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
        allowSeparatedGroups: true,
      },
    ],
    "import/no-default-export": "error",
    "import/no-duplicates": "error",
    "import/no-extraneous-dependencies": [
      "error",
      {
        packageDir: [__dirname],
        peerDependencies: true,
      },
    ],
  },
};
