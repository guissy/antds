/*
@see https://github.com/google/zx
*/
import { $, cd, fs, glob } from "zx";
import { checkPkgInstall, cwd, react2Solid, resolvePkg } from "./a-rc-template.mjs";

export const getRepo = async (rc: string) => {
    cd(`${cwd}/packages`);
    (await fs.pathExists(`rc-${rc}-solid`)) &&
        (await $`rm -rf rc-${rc}-solid`);

    await $`git clone --depth=1 https://github.com/react-component/portal.git rc-${rc}`;
};

const rc = 'portal'
await checkPkgInstall(rc);
await getRepo(rc);
await resolvePkg(rc);
await react2Solid(rc);
await $`cp -Rf ${cwd}/dev/rc-${rc}-solid-source/* ${cwd}/packages/rc-${rc}-solid`;
await $`cd ${cwd}/packages/rc-${rc}-solid`;
await $`git commit -am 'react to solid'`;
// await $`npx jest`;
// await $`rm ${cwd}/packages/rc-${rc}-solid/src/Dialog/Content/MemoChildren.tsx`