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

async function checkFormat() {
  const prettierPromise = new Promise<boolean>((resolve) => {
    exec(
      'yarn prettier -c "packages/**/*.{js,ts,mjs,json}" "scripts/**/*.ts"',
      (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        if (error) {
          resolve(true);
        }
        resolve(false);
      },
    );
  });
  const prettierUpdated = await prettierPromise;
  const licensesUpdated = await doLicense(false);
  let exitCode = 0;
  if (licensesUpdated) {
    console.error(
      "License headers were changed. Make sure to run `yarn format`.",
    );
    exitCode = 1;
  }
  if (prettierUpdated) {
    console.error("Formatting needs fixes. Make sure to run `yarn format`.");
    exitCode = 1;
  }
  process.exit(exitCode);
}

checkFormat();
