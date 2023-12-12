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

import fs from "fs";
import { join } from "path";
import { globSync } from "glob";

const licenseHeader = fs.readFileSync(
  join(__dirname, "./license.txt"),
  "utf-8",
);

const copyrightPattern = /Copyright \d{4} Google (Inc\.|LLC)/;
const globPattern = "+(packages|scripts|samples)/**/*.+(ts|js)";

async function readFiles(paths: string[]) {
  const fileContents = paths.map((path) => fs.readFileSync(path, "utf-8"));
  return fileContents.map((text, idx) => ({
    contents: text,
    path: paths[idx],
  }));
}

function addLicenseTag(contents: string) {
  const lines = contents.split("\n");
  let newLines: string[] = [];
  for (const line of lines) {
    if (line.match(copyrightPattern)) {
      const indent = line.split("*")[0]; // Get whitespace to match
      newLines.push(indent + "* @license");
    }
    newLines.push(line);
  }
  return newLines.join("\n");
}

export async function doLicense(write: boolean): Promise<boolean> {
  let count = 0;

  const filesToChange: string[] = globSync(globPattern, {
    ignore: ["**/node_modules/**", "./node_modules/**", "**/dist/**"],
  });

  console.log(`Validating license headers in ${filesToChange.length} files.`);
  const files = await readFiles(filesToChange);

  await Promise.all(
    files.map(({ contents, path }) => {
      let result = contents;

      // Files with no license block at all.
      if (result.match(copyrightPattern) == null) {
        result =
          licenseHeader.replace("2023", String(new Date().getFullYear())) +
          result;
        console.log(`Adding license to ${path}.`);
      }

      // Files with no @license tag.
      if (result.match(/@license/) == null) {
        result = addLicenseTag(result);
        console.log(`Adding @license tag to ${path}.`);
      }

      if (contents !== result) {
        count++;
        if (write) {
          return fs.writeFileSync(path, result, "utf-8");
        }
      } else {
        return Promise.resolve();
      }
    }),
  );
  if (count === 0) {
    console.log(`No files needed license changes.`);
    return false;
  } else {
    console.log(`${count} files had license headers updated.`);
    return true;
  }
}
