import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  input: 'lib/index.js',
  output: { file: 'lib/jap.js', format: 'iife', name: 'jap' },
  plugins: [
    nodeResolve(),
    commonjs()
  ]
};