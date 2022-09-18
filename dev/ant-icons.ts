import $ from "https://deno.land/x/dax@0.12.0/mod.ts";
import reactToSolid from "./react-to-solid.ts";
import {camelCase, upperFirst, kebabCase} from 'https://cdn.skypack.dev/lodash?dts';

const cwd = Deno.cwd();
$.cd(`${cwd}/packages`);

// await $`rm -rf ant-design-icons`;
// await $.exists('antd-solid-icons/icons-react') && await $`rm -rf antd-solid-icons/icons-react`;
// await $.exists('antd-solid-icons/icons-svg') && await $`rm -rf antd-solid-icons/icons-svg`;

// await $`git clone --depth=1 https://github.com/ant-design/ant-design-icons.git`;
// !await $.exists('antd-solid-icons') && await $`mkdir antd-solid-icons`;
// await $`cp -rf ant-design-icons/packages/icons-svg antd-solid-icons`;
// await $`cp -rf ant-design-icons/packages/icons-react antd-solid-icons`;

// // package.json
// await $`cp -f ../dev/package.template.json antd-solid-icons/package.json`;
// const p1 = await $`cat ant-design-icons/packages/icons-react/package.json`.stdout("pipe");
// const p2 = await $`cat antd-solid-icons/package.json`.stdout("pipe");
// const pkg1 = p1.stdoutJson;
// const pkg2 = p2.stdoutJson;
// pkg2.name = "@ant-design/icon-solid";
// pkg2.description = "forked from " + pkg1.repository;
// pkg2.contributors = pkg1.contributors;
// pkg2.version = pkg1.version;
// pkg2.unpkg
// delete pkg2.unpkg
// delete pkg2.main
// pkg2.module = "./src/index.ts",
// const deps = {...pkg1.dependencies, ...pkg2.dependencies};
// pkg2.dependencies = deps;
// await Deno.writeFile("antd-solid-icons/package.json", new TextEncoder().encode(JSON.stringify(pkg2, null, '  ')));
// $.cd(`${cwd}`);
// await $`pnpm i -F @ant-design/icons`
// await $`pnpm i -F @ant-design/icons-svg`
// await $`yarn i1 && echo `;

$.cd(`${cwd}/packages`);

// react to solid
let n = 9999;
let count = 0;
await $`cp -rf ant-design-icons/packages/icons-react/src antd-solid-icons/icons-react`;
for await (const file of $.fs.expandGlob(`antd-solid-icons/icons-react/src/**/*.{ts,tsx}`)) {
    if (count == n) {
        break;
    }
    let s1 = await $`cat ${file.path}`.stdout("pipe");
    let s2 = reactToSolid(s1.stdout);
    await Deno.writeFile(file.path, new TextEncoder().encode(s2));
    count += 1;
}

count = 0;
for await (const file of $.fs.expandGlob(`antd-solid-icons/icons-react/src/**/*.{ts,tsx}`)) {
    if (count == n) {
        break;
    }
    console.log(file.path);
    let s1 = await $`cat ${file.path}`.stdout("pipe");
    let s2 = s1.stdout.replaceAll(' as IconBaseComponent<IconComponentProps>;', '')
    .replace(/import (\w+) from '@ant\-design\/icons\-svg\/lib/, `import $1 from '@ant-design/icons-svg/es`)
    .replace(/but got \${icon}/, `but got \${JSON.stringify(icon)}`);
    await Deno.writeFile(file.path, new TextEncoder().encode(s2));
    count += 1;
}

// console.log(`cp -f ${cwd}/dev/utils.ts ${cwd}/packages/antd-solid-icons/icons-react/src/utils.ts`)
 await $`cp -f ${cwd}/dev/utils.ts ${cwd}/packages/antd-solid-icons/icons-react/src/utils.ts && echo`;
