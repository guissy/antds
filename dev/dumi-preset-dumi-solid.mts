/*
@see https://github.com/google/zx
*/
import { $, cd, glob } from "zx";
import nodeFs from "fs/promises";
import { checkPkgInstall, cwd, rcLib, resolvePkg } from "./a-rc-template.mjs";
import reactToSolidTest from "./react-to-solid-test.mjs";
import reactToSolid from "./react-to-solid.mjs";

// "homepage": "https://github.com/umijs/dumi/tree/1.x/packages/preset-dumi#readme",


export const react2Solid = async () => {
  cd(`${cwd}/packages/dumi-preset-dumi-solid`);
  for await (const file of await glob(`{src,tests,docs,examples}/**/*.{ts,tsx}`)) {
      $.verbose = false;
      let s1 = await $`cat ${file}`;
      $.verbose = true;
      let s2 = reactToSolid(s1.stdout);
      s2 = rcLib(s2);
      if (file.endsWith(".spec.tsx") || file.endsWith(".test.tsx")) {
          s2 = reactToSolidTest(s2);
          s2 = s2.replace(/\bact\(\(\) => {([^}]+)}\);/g, "$1");
      }
      s2 = s2.replace(/(import ReactDOM from 'react-dom';)/, "");
      await nodeFs.writeFile(file, s2);
  }
};

await react2Solid();

// await $`npx jest`;