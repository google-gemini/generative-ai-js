/**
 * @license
 * Copyright 2023 Google LLC
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

import { exec } from "child_process";
import { doLicense } from "./license";

async function runFormat() {
  const prettierPromise = new Promise<boolean>((resolve) => {
    exec(
      'yarn prettier --write "packages/**/*.{js,ts,mjs,json}" "scripts/**/*.ts"',
      (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        if (error) {
          resolve(false);
        }
        resolve(true);
      },
    );
  });
  try {
    await prettierPromise;
    await doLicense(true);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

runFormat();
