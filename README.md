# @zjarlin/element-picker

浏览器里点一下元素就知道它写在哪行源码 —— 类似 Chrome DevTools 的元素检查，但落在**生产站点**上也成立。
Vite + Vue 3 项目的「元素拾取 → 源码定位」独立库，无业务符号，可直接被任意项目依赖。

## 为什么不是 sourcemap

sourcemap 只在 DevTools 里有用：它把「压缩后的 JS 位置」映射回源码，但浏览器里你**拿不到某个
DOM 元素对应哪段 JS**。要回答「这块 DOM 写在哪」，必须在元素自身上留标记。

## 三层

| 入口 | 职责 | 依赖 |
| --- | --- | --- |
| `@zjarlin/element-picker/vite` | 编译期把 `data-source-loc="src/x.vue:12:3"` 写进原生元素；把本地 `.vue` 清单注入 HTML | vite, vue/compiler-sfc（peer） |
| `@zjarlin/element-picker/location` | 纯函数：解析位置、找最近的带标记祖先、从 Vue 实例读组件链 | 无 |
| `@zjarlin/element-picker/browser` | Shadow DOM 覆盖层：悬停高亮 + 点击出卡片（位置/组件链/复制/跳编辑器） | 无 |

三层的实现互不耦合，可以只用其中一层（例如自己已有拾取 UI，只借 `/vite` 的编译期标记）。

## 接入

```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue'
import { markSourceElements, sourceLocatorPlugin } from '@zjarlin/element-picker/vite'

export default defineConfig({
  plugins: [
    vue({
      // 生产构建默认会把 __file / __vueParentComponent 裁掉，组件链要靠它们。
      // 必须走插件自己的 features 开关：直接 define `__VUE_PROD_DEVTOOLS__`
      // 会被 plugin-vue 的默认值覆盖，产物里根本不会留下这两个属性。
      features: { prodDevtools: true },
      template: { compilerOptions: { nodeTransforms: [markSourceElements()] } },
    }),
    sourceLocatorPlugin(),
  ],
})
```

`features.prodDevtools` 只在**生产构建**下才有区别；开发构建默认保留。

```ts
// 任意宿主代码（浏览器端）
import { createSourcePicker } from '@zjarlin/element-picker/browser'

const picker = createSourcePicker({
  root: '/abs/project/root',
  repo: { baseUrl: 'https://github.com/me/repo' },
  onPick: (detail) => console.log(detail.location),   // { file, line, column } | null
})
picker.enable()          // ⌘⇧E / Ctrl⇧E 切换
// picker.destroy()      // 卸载时清掉监听与覆盖层
```

## API

- `/vite`：`markSourceElements(options)`（交给 `@vitejs/plugin-vue` 的 `nodeTransforms`）、`sourceLocatorPlugin(options)`（Vite 插件，注入 `.vue` 清单）。
- `/location`：`parseLocation`、`formatLocation`、`locateElement`、`normalizeFile`、`componentChain`、`createFileResolver`、`filesNamed`、`instanceProps`，以及 `SOURCE_ATTRIBUTE` / `SourceLocation` / `ComponentFrame` / `PickedElement` 等类型。
- `/browser`：`createSourcePicker(options)` 返回 `{ enable, disable, toggle, active, destroy }`；`readManifest`、`describePath`、`repoUrl` 也被导出。

`createSourcePicker` 的选项（`SourcePickerOptions`）：

| 选项 | 默认 | 说明 |
| --- | --- | --- |
| `hotkey` | `'mod+shift+e'` | 切换快捷键；传 `null` 关闭 |
| `files` | 读注入 HTML 的清单 | 本地 `.vue` 清单来源 |
| `repo` | — | `{ baseUrl, branch }`，给了就多一个「在仓库查看」 |
| `editorEndpoint` | `'/__open-in-editor'` | Vite dev server 端点；传 `false` 关闭「在编辑器打开」 |
| `onPick` / `onChange` | — | 选中 / 激活状态回调 |
| `describePage` | — | 宿主补一句「这一页来自哪份 schema」 |
| `labels` | 中文 | 覆盖卡片文案（便于 i18n） |

## 约定

- 只标 **原生元素**：`<el-button>` 这类组件不标（多根组件会丢属性、属性会透传到第三方 DOM），
  它们的来源由组件链回答。
- 属性值是**仓库内相对路径**，所以生产构建、压缩、分块都不影响；`line:column` 是 1 基。
- 生产构建的 `__file` 只是 basename，`componentChain` 用清单还原目录；同名文件会给出候选而不是猜一个。
- 生产站点上 `/__open-in-editor` 不存在，拾取器会**先探测再显示**按钮（不可用就只保留「复制位置」）。
- 动态创建的 DOM（弹窗、`v-html`）没有标记，卡片会明说「没有源码标记」，不瞎猜位置。

## 开发

```bash
pnpm install
pnpm typecheck      # tsc --noEmit
pnpm build          # 产出 dist/（发布用）
```

## 发布

走 GitHub Actions OIDC Trusted Publishing（不使用任何长期 token、不手输 OTP）。

一次性前置（在本机终端、需要 npm 2FA；`npm trust` 要求 `npm@^11.15.0`）：

```bash
# 包必须先存在于 registry（首次发布见下），npm trust 才能在它上面挂信任关系
npx --yes npm@11.15 trust github @zjarlin/element-picker \
  --file publish-npm.yml --repo zjarlin/element-picker --allow-publish -y
```

之后推 `v*` tag（或手动 `workflow_dispatch`）即由 CI 发布；首次发布的 2 天窗口内必须完成一次成功发布，
否则信任关系过期需重建。
