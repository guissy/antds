/*
@see https://github.com/google/zx
*/
import { $, cd, fs, glob } from "zx";
import nodeFs from "fs/promises";
import reactToSolid from "./react-to-solid.mjs";
import reactToSolidTest from "./react-to-solid-test.mjs";

export const cwd = (await $`pwd`).stdout.toString().trim();
export let hasInstall = true;

export const checkPkgInstall = async (rc: string) => {
    await $`mkdir packages`.catch(() => 1);
    const hasDev = await fs.pathExists(`dev/rc-${rc}-solid-source`);
    if (!hasDev) {
        await $`mkdir -p dev/rc-${rc}-solid-source`
        .then(async () => {
            await $`cp dev/rc-trigger-solid-source/index.html dev/rc-${rc}-solid-source/index.html`
            await $`cp dev/rc-trigger-solid-source/jest.config.js dev/rc-${rc}-solid-source/jest.config.js`
            await $`cp dev/rc-trigger-solid-source/jest.setup.ts dev/rc-${rc}-solid-source/jest.setup.ts`
            await $`cp dev/rc-trigger-solid-source/tsconfig.json dev/rc-${rc}-solid-source/tsconfig.json`
            await $`cp dev/rc-trigger-solid-source/vite.config.ts dev/rc-${rc}-solid-source/vite.config.ts`
            await $`cp dev/rc-trigger-solid-source/src/main.tsx dev/rc-${rc}-solid-source/src/main.tsx`
        })
        .catch(() => 1);
    }
    cd(`${cwd}/packages`);
    hasInstall = await fs.pathExists(`rc-${rc}-solid/node_modules`);
}

export const getRepo = async (rc: string) => {
    cd(`${cwd}/packages`);
    await $`rm -rf ant-design-icons`;
    (await fs.pathExists(`rc-${rc}-solid`)) &&
        (await $`rm -rf rc-${rc}-solid`);

    await $`git clone --depth=1 https://github.com/react-component/${rc}.git rc-${rc}`;
};

export const resolvePkg = async (rc: string) => {
    // package.json
    cd(`${cwd}/packages`);
    await $`rm -rf rc-${rc}-solid`;
    await $`mv rc-${rc} rc-${rc}-solid`;
    const p1 = await $`cat rc-${rc}-solid/package.json`;
    const pkg = JSON.parse(p1.stdout);
    delete pkg.unpkg;
    delete pkg.main;
    pkg.name = `rc-${rc}-solid`;
    pkg.description = "adapte rc-${rc} for solid-js";
    pkg.module = "./src/index.ts";
    pkg.scripts.start = "vite dev";
    pkg.scripts.test = "NODE_ENV=production jest";
    delete pkg.scripts.compile;
    delete pkg.gitHead;
    const reactPkg = [
        "react",
        "react-dom",
        "mobx",
        "mobx-react",
        "@types/enzyme",
        "enzyme",
        "enzyme-to-json",
        "create-react-class",
        "react-is"
    ];
    const aliPkg = ["father", "@umijs/fabric", "antd", "dumi"];
    for (let k of [...reactPkg, ...aliPkg]) {
        delete pkg.devDependencies[k];
        delete pkg.dependencies[k];
    }
    if (pkg.devDependencies["styled-components"]) {
        pkg["solid-styled-components"] = "lastest";
        delete pkg.devDependencies["styled-components"];
    }
    Object.assign(pkg.devDependencies, {
        "@babel/preset-env": "^7.19.1",
        "@testing-library/jest-dom": "^5.16.5",
        "@types/jest": "^29.0.3",
        "@types/testing-library__jest-dom": "^5.14.5",
        "babel-preset-solid": "^1.5.5",
        jest: "^29.0.3",
        "jest-environment-jsdom": "^29.0.3",
        "solid-testing-library": "^0.3.0",
        "solid-styled-components": "^0.28.4",
        "ts-jest": "^29.0.1",
        "ts-node": "^10.9.1",
        vite: "^3.0.9",
        "vite-plugin-solid": "^2.3.0",
        // "dom-align": "^1.7.0"
    });
    // sort object by key
    pkg.devDependencies = Object.fromEntries(
        Object.entries(pkg.devDependencies).sort((a, b) => (a[0] < b[0] ? -1 : 1))
    );
    pkg.dependencies.typescript = "^4.8.2"
    pkg.peerDependencies = {
        "solid-js": ">=1.5.0",
    };
    await nodeFs.writeFile(
        `rc-${rc}-solid/package.json`,
        JSON.stringify(pkg, null, "  ")
    );

    // typescript
    const p2 = await $`cat rc-${rc}-solid/tsconfig.json`;
    const tsconfig = JSON.parse(p2.stdout);
    tsconfig.compilerOptions.jsx = "preserve";
    tsconfig.compilerOptions.jsxImportSource = "solid-js";
    await nodeFs.writeFile(
        `rc-${rc}-solid/tsconfig.json`,
        JSON.stringify(tsconfig, null, "  ")
    );
    try {
        cd(`${cwd}/packages/rc-${rc}-solid`);

        for await (const file of await glob(`{src,tests,docs}/**/*.{js,jsx}`)) {
            const fileTs = file.replace(/\.j(sx?)$/, ".tsx");
            await $`mv ${file} ${fileTs}`;
        }
        await $`rm -f tests/__snapshots__/*`;
        if (hasInstall) {
            await $`npm i --prefer-offline --no-audit --progress=false --legacy-peer-deps`;
        } else {
            await $`npm i --registry=https://registry.npmjs.org`
        }
    } catch (e) {
        console.log(e);
    }
};

// react to solid
export const react2Solid = async (rc: string) => {
    cd(`${cwd}/packages/rc-${rc}-solid`);
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

export const rcLib = (source: string): string => {
    return source.replace(/from 'rc-([a-z-]+)+/g, "from 'rc-$1-solid")
}
