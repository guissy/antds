/*
@see https://github.com/google/zx
*/
import { $, cd, fs, glob } from "zx";
import { checkPkgInstall, cwd, getRepo, react2Solid, resolvePkg } from "./a-rc-template.mjs";

const rc = 'dialog'
await checkPkgInstall(rc);
await getRepo(rc);
await resolvePkg(rc);
await react2Solid(rc);
await $`cp -Rf ${cwd}/dev/rc-${rc}-solid-source/* ${cwd}/packages/rc-${rc}-solid`;
await $`cd ${cwd}/packages/rc-${rc}-solid`;
await $`git commit -am 'react to solid'`;
// await $`npx jest`;
// await $`rm ${cwd}/packages/rc-${rc}-solid/src/Dialog/Content/MemoChildren.tsx`