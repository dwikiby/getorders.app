import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import buble from "rollup-plugin-buble";
import json from "@rollup/plugin-json";

export default {
  input: "src/main.js",
  output: {
    format: "iife",
    file: "public/bundle.js",
    name: "app",
  },
  plugins: [
    svelte({
      css: (css) => css.write("public/bundle.css"),
    }),
    resolve({ browser: true }),
    commonjs(),
    json(),
    buble({
      objectAssign: "Object.assign",
      transforms: { dangerousForOf: true },
    }),
  ],
};
