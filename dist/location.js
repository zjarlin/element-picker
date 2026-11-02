// 源位置的基础契约：一个 DOM 元素「来自哪个文件的第几行第几列」。
//
// 编译期写进属性、运行期读取，两者共用这一个形状；
// 因此包本身不认 Vue 组件、不认路由、不认任何业务符号，任何前端都能用。
/** 编译期写进 DOM 的属性名；拾取器按它反查源位置。 */
export const SOURCE_ATTRIBUTE = 'data-source-loc';
/** `src/a.vue:12:3` → `{ file, line, column }`；不合法返回 null。 */
export function parseLocation(text) {
    if (!text)
        return null;
    const match = text.match(/^(.*):(\d+):(\d+)$/);
    if (!match)
        return null;
    const [, file, line, column] = match;
    if (!file || !line || !column)
        return null;
    return { file, line: Number(line), column: Number(column) };
}
/** 统一成 `file:line:column`（复制给同事或粘进编辑器都能直接用）。 */
export function formatLocation(location) {
    return `${location.file}:${location.line}:${location.column}`;
}
/** 从元素自身或最近的祖先读源位置：文本节点落在元素内也能定位到所属标签。 */
export function locateElement(element, attribute = SOURCE_ATTRIBUTE) {
    const host = element.closest(`[${attribute}]`);
    if (!host)
        return null;
    return parseLocation(host.getAttribute(attribute));
}
/** 路径归一：统一分隔符、去掉 `./`；不做任何「猜目录」的动作。 */
export function normalizeFile(file) {
    if (!file)
        return null;
    const slash = file.replace(/\\/g, '/').replace(/^\.\//, '');
    return slash || null;
}
export function createFileResolver(files) {
    const known = new Set(files);
    const byName = new Map();
    for (const file of files) {
        const name = file.split('/').pop();
        if (!name)
            continue;
        const bucket = byName.get(name);
        if (bucket)
            bucket.push(file);
        else
            byName.set(name, [file]);
    }
    const suffixes = (file) => {
        const parts = normalizeFile(file)?.split('/') ?? [];
        const out = [];
        for (let index = 0; index < parts.length; index += 1)
            out.push(parts.slice(index).join('/'));
        return out;
    };
    const resolver = ((file) => {
        for (const suffix of suffixes(file)) {
            if (known.has(suffix))
                return suffix;
        }
        const name = normalizeFile(file)?.split('/').pop();
        return name ? byName.get(name)?.[0] ?? null : null;
    });
    resolver.candidates = (file) => {
        for (const suffix of suffixes(file)) {
            if (known.has(suffix))
                return [suffix];
        }
        const name = normalizeFile(file)?.split('/').pop();
        return name ? byName.get(name) ?? [] : [];
    };
    return resolver;
}
/**
 * 组件链上的 props（由内到外）。
 *
 * 用途：配置驱动的页面把「这一页是哪个 schema」写在 `SchemaPage` 的 props 里，
 * 只有拿到 props 才能把「渲染壳」补成「页面定义在哪里」。
 */
export function instanceProps(element, limit = 8) {
    const out = [];
    const seen = new Set();
    let instance = instanceOf(element);
    while (instance && out.length < limit && !seen.has(instance)) {
        seen.add(instance);
        const props = instance.props;
        if (typeof props === 'object' && props !== null)
            out.push(props);
        instance = asInstance(instance.parent);
    }
    return out;
}
/** 同一 basename 对应的全部源码文件（生产构建压成 basename 时用来提示歧义）。 */
export function filesNamed(files, basename) {
    return files.filter((file) => file === basename || file.endsWith(`/${basename}`));
}
function asInstance(value) {
    return typeof value === 'object' && value !== null ? value : null;
}
function instanceOf(element) {
    const holder = element;
    // Vue 挂载时懒定义 `__vueParentComponent`：dev 构建或开了 prod devtools 才有。
    return asInstance(holder['__vueParentComponent']);
}
/**
 * 组件链：从承载 DOM 的实例一路向上，回答「这一块是谁渲染的」。
 *
 * 由内到外返回，调用方可以直接把最后一项当页面组件。
 */
export function componentChain(element, options = {}) {
    const limit = options.limit ?? 24;
    const frames = [];
    const seen = new Set();
    let instance = instanceOf(element);
    while (instance && frames.length < limit && !seen.has(instance)) {
        seen.add(instance);
        const type = instance.type ?? instance.vnode?.type ?? null;
        const resolved = type?.__file ? (options.resolve?.(type.__file) ?? normalizeFile(type.__file)) : null;
        const named = type?.name || type?.__name;
        frames.push({
            file: resolved,
            name: named || (resolved ? resolved.split('/').pop()?.replace(/\.vue$/, '') ?? resolved : 'Anonymous'),
            local: resolved !== null && !resolved.includes('node_modules/'),
        });
        instance = asInstance(instance.parent);
    }
    // 去掉「没有源码、也没有名字」的内建实现帧（过渡、Fragment 包装之类）：
    // 它们对「这块 DOM 写在哪」没有帮助，只会把真正的页面组件挤出前几位。
    const meaningful = frames.filter((frame) => frame.file !== null || frame.name !== 'Anonymous');
    return meaningful.length ? meaningful : frames;
}
