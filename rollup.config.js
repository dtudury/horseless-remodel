import pkg from './package.json'
import { terser } from 'rollup-plugin-terser'

export default [{
  input: 'remodel.js',
  plugins: [terser()],
  output: [{ file: pkg.module, format: 'es' }]
}, {
  input: 'remodel.js',
  output: [{
    file: pkg.devmodule, format: 'es'
  }]
}]
