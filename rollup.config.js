import pkg from './package.json'
import { terser } from 'rollup-plugin-terser'

export default [{
  input: 'index.js',
  plugins: [terser()],
  output: [{ file: pkg.module, format: 'es' }]
}, {
  input: 'index.js',
  output: [{
    file: pkg.main, format: 'cjs'
  }, {
    file: pkg.devmodule, format: 'es'
  }]
}]
