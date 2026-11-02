// tsc 只能输出 .js，无法直接给 CommonJS 产物 .cjs 扩展名。
// 在 dist/cjs 下放一个 {"type":"commonjs"}，Node 就会把该目录里的 .js 当 CJS 解析。
// 这样同一个包既能被 Vite 6+ 的 ESM 配置 import，也能被 Vite 5 的 CJS 配置 require。
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const cjsDir = join(root, 'dist', 'cjs')
mkdirSync(cjsDir, { recursive: true })
writeFileSync(join(cjsDir, 'package.json'), `${JSON.stringify({ type: 'commonjs' }, null, 2)}\n`)
