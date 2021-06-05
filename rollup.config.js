import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import builtins from 'builtin-modules';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
  plugins: [
    resolve({ preferBuiltins: true, mainFields: ['main', 'module'] }),
    commonjs(),
    typescript(),
  ],  
  external: [
    ...builtins,
    'ethers',
    'web3',
    'axios',
    /^defender-[^\-]+-client(\/.*)?$/,
  ],
};