import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import babel from "@rollup/plugin-babel";

import { eslint } from "rollup-plugin-eslint";
import { terser } from "rollup-plugin-terser";
import banner from "rollup-plugin-banner";
import filesize from "rollup-plugin-filesize";

import pkg from "./package.json";

const config = [];
const files = ["Panzoom", "Panzoom.Controls", "Carousel", "Carousel.Autoplay", "Fancybox"];

for (const file_name of files) {
  let input_file;
  let output_file;

  const parts = file_name.split(".");
  const component = parts[0];
  const plugin = parts[1] || false;

  if (plugin) {
    input_file = `${component}/plugins/${plugin}/${plugin}.js`;
    output_file = `${component.toLowerCase()}.${plugin.toLowerCase()}`;
  } else {
    input_file = `${component}/index.js`;
    output_file = component.toLowerCase();
  }

  config.push({
    input: `src/${input_file}`,
    output: {
      file: `dist/${output_file}.esm.js`,
      format: "es",
      exports: "named",
    },
    plugins: [
      eslint(),
      replace({ __VERSION__: pkg.version, preventAssignment: true }),
      terser(),
      banner(`@fancyapps/ui/${file_name} v${pkg.version}`),
      filesize({ showMinifiedSize: false }),
    ],
  });

  config.push({
    input: `src/${input_file}`,
    output: {
      file: `dist/${output_file}.umd.js`,
      format: "umd",
      name: "window",
      esModule: false,
      extend: true,
      exports: "named",
    },
    plugins: [
      babel({
        babelrc: false,
        exclude: "node_modules/**",
        presets: [["@babel/preset-env"]],
        babelHelpers: "bundled",
      }),
      resolve(),
      commonjs(),
      eslint(),
      replace({ __VERSION__: pkg.version, preventAssignment: true }),
      terser(),
      banner(`@fancyapps/ui/${file_name} v${pkg.version}`),
      filesize({ showMinifiedSize: false }),
    ],
  });
}

export default config;
