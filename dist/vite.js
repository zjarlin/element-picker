// 编译期注入：把「这段 DOM 写在哪个文件的第几行第几列」写进元素属性。
//
// 为什么不用 sourcemap 反查：sourcemap 只在 DevTools 里好用，生产站点上浏览器
// 拿不到「元素 → 源码」的映射；而一个普通属性既能跨构建保留，又不受压缩与分块影响。
//
// 只标原生元素（tagType 0）：
// - 组件标签（`<el-button>`、`<MyCard>`）不标，避免多根组件丢属性、避免属性透传到第三方 DOM；
// - 组件自身的位置由运行期的组件链回答（见 `location.ts` 的 `componentChain`）。
import { readdirSync } from 'node:fs';
import path from 'node:path';
/** 默认属性名；与 `SOURCE_ATTRIBUTE` 保持一致。 */
export const SOURCE_LOCATOR_ATTRIBUTE = 'data-source-loc';
/** 生产构建里 `__file` 只有 basename，浏览器靠这份清单还原目录。 */
export const SOURCE_LOCATOR_MANIFEST_ID = 'source-locator-files';
/** 这些标签不是界面元素，标了也没有意义。 */
const SKIP_TAGS = new Set(['template', 'script', 'style', 'slot', 'component']);
/**
 * 交给 `@vitejs/plugin-vue` 的 `template.compilerOptions.nodeTransforms`。
 *
 * 放在编译器里做（而不是在源码字符串上插字符），Vue 才能据此生成正确的 sourcemap：
 * 元素位置仍指向原文件真实行列，不因为插入属性而整体偏移。
 * 已标过的节点直接跳过，所以 HMR/SSR 复用同一份 AST 也不会写出重复属性。
 */
export function markSourceElements(options = {}) {
    const attribute = options.attribute ?? SOURCE_LOCATOR_ATTRIBUTE;
    const root = options.root ?? process.cwd();
    const transform = (raw, rawContext) => {
        if (raw.type !== 1)
            return;
        const element = raw;
        if (element.tagType !== 0 || SKIP_TAGS.has(element.tag))
            return;
        if (element.props.some((prop) => prop.type === 6 && prop.name === attribute))
            return;
        const filename = rawContext.filename;
        if (!filename.endsWith('.vue') || filename.includes('/node_modules/'))
            return;
        if (options.exclude?.test(filename))
            return;
        const relative = path.relative(root, filename).replace(/\\/g, '/');
        const { line, column } = element.loc.start;
        element.props.push({
            type: 6,
            name: attribute,
            nameLoc: element.loc,
            value: { type: 2, content: `${relative}:${line}:${column}`, loc: element.loc },
            loc: element.loc,
        });
    };
    return transform;
}
/** 源码里的本地 `.vue` 清单：只扫源码目录，不碰 node_modules 与产物目录。 */
function collectVueFiles(root, directories) {
    const skip = new Set(['node_modules', 'dist', '.git', '.run', '.data', 'coverage']);
    const files = [];
    const visit = (dir) => {
        let entries;
        try {
            entries = readdirSync(dir, { withFileTypes: true });
        }
        catch {
            return;
        }
        for (const entry of entries) {
            if (entry.isDirectory()) {
                if (!skip.has(entry.name))
                    visit(path.join(dir, entry.name));
                continue;
            }
            if (entry.name.endsWith('.vue'))
                files.push(path.relative(root, path.join(dir, entry.name)).replace(/\\/g, '/'));
        }
    };
    for (const dir of directories)
        visit(path.join(root, dir));
    return files.sort();
}
/**
 * 宿主侧插件：把本地 `.vue` 清单注入 HTML。
 *
 * 生产构建会把 `__file` 压成 basename，清单让浏览器端把它还原成完整相对路径；
 * `data-source-loc` 本身就是完整相对路径，所以清单缺失时拾取仍然可用。
 */
export function sourceLocatorPlugin(options = {}) {
    const emitManifest = options.manifest ?? true;
    const directories = options.directories ?? ['src', 'packages'];
    let files = [];
    return {
        name: 'element-picker:source-locator-manifest',
        configResolved(config) {
            files = collectVueFiles(options.root ?? config.root, directories);
        },
        transformIndexHtml(html) {
            if (!emitManifest)
                return html;
            const payload = JSON.stringify(files).replace(/</g, '\\u003c');
            return {
                html,
                tags: [
                    {
                        tag: 'script',
                        injectTo: 'head-prepend',
                        attrs: { type: 'application/json', id: SOURCE_LOCATOR_MANIFEST_ID },
                        children: payload,
                    },
                ],
            };
        },
    };
}
