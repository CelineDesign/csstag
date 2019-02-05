import commonJS from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import nodeBuiltins from 'rollup-plugin-node-builtins';
import nodeResolve from 'rollup-plugin-node-resolve';
import virtual from 'rollup-plugin-virtual';
import { spawn } from 'child_process';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      file: `dist/index.js`,
      format: 'cjs',
      sourcemap: true,
    },
    {
      banner: `
const process = { argv: [], env: {} };
var global = typeof global === 'undefined' ? window : global;
`,
      file: `dist/index.mjs`,
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    {
      buildStart: () =>
        spawn('rm', [
          '-fr',
          'node_modules/postcss-modules-parser/node_modules/postcss',
        ]),
    },
    virtual({ 'source-map': '' }),
    nodeResolve(),
    commonJS(),
    nodeBuiltins(),
    json(),
    {
      renderChunk: (code, chunk, options) => {
        const start = code.indexOf('\nvar container = ');
        const string = '\nunwrapExports(container);';
        const end = code.indexOf(string, start) + string.length;
        const position = code.indexOf('\nvar rule = ');
        return (
          code.slice(0, position) +
          code.slice(start, end) +
          code.slice(position, start) +
          code.slice(end)
        );
      },
    },
    terser(),
  ],
};