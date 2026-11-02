import type { CompilerOptions } from 'vue/compiler-sfc';
import type { Plugin } from 'vite';
/** 默认属性名；与 `SOURCE_ATTRIBUTE` 保持一致。 */
export declare const SOURCE_LOCATOR_ATTRIBUTE = "data-source-loc";
/** 生产构建里 `__file` 只有 basename，浏览器靠这份清单还原目录。 */
export declare const SOURCE_LOCATOR_MANIFEST_ID = "source-locator-files";
/**
 * 只借用 `CompilerOptions['nodeTransforms']` 的元素类型。
 *
 * 这样包不必新增 `@vue/compiler-core` 依赖：vite/vue 已经是 peer，
 * 类型从 `vue/compiler-sfc` 的公开导出派生即可。
 */
type NodeTransforms = NonNullable<CompilerOptions['nodeTransforms']>;
export type TemplateNodeTransform = NodeTransforms[number];
export interface SourceLocatorOptions {
    /** 属性名覆盖；一般不需要改。 */
    attribute?: string;
    /** 路径基准；默认取 Vite root。 */
    root?: string;
    /** 额外排除的路径（node_modules 已默认排除）。 */
    exclude?: RegExp;
    /** 是否把本地 `.vue` 清单注入 HTML；默认 true。 */
    manifest?: boolean;
    /** 清单要扫描的顶层目录；默认 `src` 与 `packages`。 */
    directories?: string[];
}
/**
 * 交给 `@vitejs/plugin-vue` 的 `template.compilerOptions.nodeTransforms`。
 *
 * 放在编译器里做（而不是在源码字符串上插字符），Vue 才能据此生成正确的 sourcemap：
 * 元素位置仍指向原文件真实行列，不因为插入属性而整体偏移。
 * 已标过的节点直接跳过，所以 HMR/SSR 复用同一份 AST 也不会写出重复属性。
 */
export declare function markSourceElements(options?: SourceLocatorOptions): TemplateNodeTransform;
/**
 * 宿主侧插件：把本地 `.vue` 清单注入 HTML。
 *
 * 生产构建会把 `__file` 压成 basename，清单让浏览器端把它还原成完整相对路径；
 * `data-source-loc` 本身就是完整相对路径，所以清单缺失时拾取仍然可用。
 */
export declare function sourceLocatorPlugin(options?: SourceLocatorOptions): Plugin;
export {};
