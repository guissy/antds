/*
@see https://github.com/google/zx
*/
import { $, cd, fs, glob } from "zx";
import nodeFs from "fs/promises";
import reactToSolid from "./react-to-solid.mjs";

const cwd = (await $`pwd`).stdout.toString().trim();
await $`mkdir packages`.catch(() => 1);
console.log(cwd)
cd(`${cwd}/packages`);

await $`rm -rf ant-design-icons`;
(await fs.pathExists("antd-solid-icons/icons-react")) &&
  (await $`rm -rf antd-solid-icons/icons-react`);
(await fs.pathExists("antd-solid-icons/icons-svg")) &&
  (await $`rm -rf antd-solid-icons/icons-svg`);

await $`git clone --depth=1 https://github.com/ant-design/ant-design-icons.git`;
!(await fs.pathExists("antd-solid-icons")) && (await $`mkdir antd-solid-icons`);
// await $`cp -rf ant-design-icons/packages/icons-svg antd-solid-icons`;
await $`cp -rf ant-design-icons/packages/icons-react antd-solid-icons`;

// package.json
const p1 = await $`cat ant-design-icons/packages/icons-react/package.json`;
const pkg1 = JSON.parse(p1.stdout);
delete pkg1.unpkg;
delete pkg1.main;
pkg1.name = "icons-solid";
pkg1.module = "./src/index.ts";
await fs.writeJson("antd-solid-icons/icons-react/package.json", pkg1);

try {
  cd(`${cwd}/packages/antd-solid-icons/icons-react`);
  await $`pnpm i`;
  await $`pnpm run generate`;
  // await $`yarn build`;
  // await $`pnpm i -F @ant-design/icons-svg`;
} catch (e) {
  console.log(e);
}

cd(`${cwd}/packages`);

// react to solid
let n = 9999;
let count = 0;
await $`cp -rf ant-design-icons/packages/icons-react/src antd-solid-icons/icons-react`;
for await (const file of await glob(
  `antd-solid-icons/icons-react/src/**/*.{ts,tsx}`
)) {
  if (count == n) {
    break;
  }
  let s1 = await $`cat ${file}`;
  let s2 = reactToSolid(s1.stdout);
  await nodeFs.writeFile(file, s2);
  count += 1;
}

count = 0;
for await (const file of await glob(
  `antd-solid-icons/icons-react/src/**/*.{ts,tsx}`
)) {
  if (count == n) {
    break;
  }
  // console.log(file);
  let s1 = await $`cat ${file}`;
  let s2 = s1.stdout
    .replaceAll(" as IconBaseComponent<IconComponentProps>;", "")
    .replace(
      /import (\w+) from '@ant\-design\/icons\-svg\/lib/,
      `import $1 from '@ant-design/icons-svg/es`
    )
    .replace(/but got \${icon}/, `but got \${JSON.stringify(icon)}`);
  await nodeFs.writeFile(file, s2);
  count += 1;
}

cd(cwd);
await $`cp -f ./dev/utils.ts ./packages/antd-solid-icons/icons-react/src/utils.ts && echo`;
