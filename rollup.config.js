import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'
import {terser} from 'rollup-plugin-terser'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'lib/' + pkg.main,
      format: 'cjs'
    },
    {
      file: 'lib/' + pkg.module,
      format: 'es'
    },
    {
      file: 'lib/' + pkg.browser,
      format: 'iife',
      name: 'jap'
    }
  ],
  external: [
    ...Object.keys(pkg.dependencies || {})
  ],
  plugins: [
    typescript({
      typescript: require('typescript'),
    }),
    terser()
  ]
}