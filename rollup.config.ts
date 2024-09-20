import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import scss from 'rollup-plugin-scss';
import copy, { Target } from 'rollup-plugin-copy';
import { defineConfig } from 'rollup';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import { cleandir } from 'rollup-plugin-cleandir';

const prod = process.env.NODE_ENV === 'production';

const copyTargets: Target[] = [
  { src: './module.json', dest: './dist' },
  { src: './templates', dest: './dist' },
];

const plugins = [
  cleandir('./dist'),
  replace({
    'process.env.NODE_ENV': prod ? "'production'" : "'development'",
    preventAssignment: true,
  }),
  commonjs(),
  typescript(),
  scss(),
  copy({ targets: copyTargets, copyOnce: true }),
];

if (prod) {
  plugins.push(terser());
}

export default defineConfig({
  input: 'src/module.ts',
  output: {
    file: 'dist/table-map.js',
    format: 'iife',
    sourcemap: !prod,
  },
  plugins,
});
