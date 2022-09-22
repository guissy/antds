/*
@see https://github.com/google/zx
*/
import { $, cd, fs, glob } from "zx";
import nodeFs from "fs/promises";
import reactToSolid from "./react-to-solid.mjs";

const cwd = (await $`pwd`).stdout.toString().trim();
await $`mkdir packages`.catch(() => 1);
console.log(cwd);
cd(`${cwd}/packages`);

const getRepo = async () => {
  await $`rm -rf ant-design-icons`;
  (await fs.pathExists("antd-icons-solid")) &&
    (await $`rm -rf antd-icons-solid`);

  await $`git clone --depth=1 https://github.com/ant-design/ant-design-icons.git`;
  await $`mv -f ant-design-icons/packages/icons-react antd-icons-solid`;
};

const resolvePkg = async () => {
  // package.json
  const p1 = await $`cat antd-icons-solid/package.json`;
  const pkg = JSON.parse(p1.stdout);
  delete pkg.unpkg;
  delete pkg.main;
  pkg.name = "@ant-design/icons-solid";
  pkg.description = "adapte @ant-design/icons for solid-js";
  pkg.module = "./src/index.ts";
  pkg.scripts.start = "vite dev";
  pkg.scripts.test = "jest";
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
  ];
  const aliPkg = ["father", "@umijs/fabric", "antd", "dumi"];
  for (let k of [...reactPkg, ...aliPkg]) {
    delete pkg.devDependencies[k];
  }
  if (pkg.devDependencies["styled-components"]) {
    pkg["solid-styled-components"] = "lastest";
    delete pkg.devDependencies["styled-components"];
  }
  Object.assign(pkg.devDependencies, {
    "@babel/preset-env": "^7.19.1",
    "@storybook/builder-webpack5": "6.5.12",
    "@storybook/theming": "6.5.12",
    "@testing-library/jest-dom": "^5.16.5",
    "@types/jest": "^29.0.3",
    "@types/testing-library__jest-dom": "^5.14.5",
    "babel-preset-solid": "^1.5.5",
    jest: "^29.0.3",
    "jest-environment-jsdom": "^29.0.3",
    "solid-testing-library": "^0.3.0",
    "storybook-dark-mode": "1.0.9",
    "ts-jest": "^29.0.1",
    "ts-node": "^10.9.1",
    vite: "^3.0.9",
    "vite-plugin-solid": "^2.3.0",
  });
  // sort object by key
  // pkg.devDependencies = JSON.parse(JSON.stringify(pkg.devDependencies))
  pkg.peerDependencies = {
    solid: ">=1.5.0",
  };
  await nodeFs.writeFile(
    "antd-icons-solid/package.json",
    JSON.stringify(pkg, null, "  ")
  );
  try {
    cd(`${cwd}/packages/antd-icons-solid`);
    await $`yarn`;
    await $`yarn generate`;
  } catch (e) {
    console.log(e);
  }
};

// react to solid
const react2Solid = async () => {
  cd(`${cwd}/packages/antd-icons-solid`);
  for await (const file of await glob(`src/**/*.{ts,tsx}`)) {
    let s1 = await $`cat ${file}`;
    let s2 = reactToSolid(s1.stdout);
    await nodeFs.writeFile(file, s2);
  }

  for await (const file of await glob(`src/**/*.{ts,tsx}`)) {
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
  }
};

await getRepo()
await resolvePkg()
await react2Solid()

cd(cwd);
await $`cp -f ./dev/main.tsx ./packages/antd-icons-solid/src/main.tsx`;
await $`cp -f ./dev/App.tsx ./packages/antd-icons-solid/src/App.tsx`;
await $`cp -f ./dev/index.html ./packages/antd-icons-solid/index.html`;
await $`cp -f ./dev/vite.config.ts ./packages/antd-icons-solid/vite.config.ts`;

// await $`rm -rf packages/ant-design-icons`;
