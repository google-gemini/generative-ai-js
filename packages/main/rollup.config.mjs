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

import replace from "rollup-plugin-replace";
import typescriptPlugin from "rollup-plugin-typescript2";
import typescript from "typescript";
import json from "@rollup/plugin-json";
import pkg from "./package.json" assert { type: "json" };

const es2017BuildPlugins = [
  typescriptPlugin({
    clean: true,
    typescript,
    tsconfigOverride: {
      compilerOptions: {
        target: "es2017",
      },
      exclude: ["**/*.test.ts", "test-utils"],
    },
  }),
  json({
    preferConst: true,
  }),
  replace({
    __PACKAGE_VERSION__: pkg.version,
  }),
];

const esmBuilds = [
  {
    input: "src/index.ts",
    output: {
      file: pkg.module,
      format: "es",
      sourcemap: true,
    },
    external: ["fs"],
    plugins: [...es2017BuildPlugins],
  },
];

const cjsBuilds = [
  {
    input: "src/index.ts",
    output: [{ file: pkg.main, format: "cjs", sourcemap: true }],
    external: ["fs"],
    plugins: [...es2017BuildPlugins],
  },
];

const serverBuilds = [
  {
    input: "src/server/index.ts",
    output: [
      { file: pkg.exports["./server"].import, format: "es", sourcemap: true },
    ],
    external: ["fs"],
    plugins: [...es2017BuildPlugins],
  },
  {
    input: "src/server/index.ts",
    output: [
      { file: pkg.exports["./server"].require, format: "cjs", sourcemap: true },
    ],
    external: ["fs"],
    plugins: [...es2017BuildPlugins],
  },
];

// eslint-disable-next-line import/no-default-export
export default [...esmBuilds, ...cjsBuilds, ...serverBuilds];
