/** 编译期写进 DOM 的属性名；拾取器按它反查源位置。 */
export declare const SOURCE_ATTRIBUTE = "data-source-loc";
/** 仓库内相对路径 + 1 基行列（与编辑器 CLI 的 `file:line:column` 一致）。 */
export interface SourceLocation {
    file: string;
    line: number;
    column: number;
}
/** 组件链上的一帧：谁渲染了这块 DOM。 */
export interface ComponentFrame {
    /** 仓库内相对路径；解析不出来时为 null（例如第三方组件）。 */
    file: string | null;
    /** 组件名；取不到时回落为文件名。 */
    name: string;
    /** 是否是本项目（非 node_modules）的组件。 */
    local: boolean;
}
/** 一次拾取的结果：命中的 DOM 元素 + 它的源位置 + 到顶层的组件链。 */
export interface PickedElement {
    element: Element;
    location: SourceLocation | null;
    chain: ComponentFrame[];
}
/** `src/a.vue:12:3` → `{ file, line, column }`；不合法返回 null。 */
export declare function parseLocation(text: string | null | undefined): SourceLocation | null;
/** 统一成 `file:line:column`（复制给同事或粘进编辑器都能直接用）。 */
export declare function formatLocation(location: SourceLocation): string;
/** 从元素自身或最近的祖先读源位置：文本节点落在元素内也能定位到所属标签。 */
export declare function locateElement(element: Element, attribute?: string): SourceLocation | null;
/** 路径归一：统一分隔符、去掉 `./`；不做任何「猜目录」的动作。 */
export declare function normalizeFile(file: string | undefined): string | null;
/**
 * 把 `__file` 还原成仓库内相对路径。
 *
 * Vue 在三处给出的形态不同：
 * - 开发构建：绝对路径（`/opt/proj/src/x.vue`）；
 * - 生产构建：只留 basename（`x.vue`）；
 * - 编译期注入的属性：本来就是相对路径（`src/x.vue`）。
 * 因此统一交给清单做「最长后缀匹配」：既不需要知道项目根，也不会把 x.vue 猜错目录。
 */
export interface FileResolver {
    /** 输入任意形态的路径，输出仓库内相对路径；对不上返回 null。 */
    (file: string): string | null;
    /** 同一 basename 命中多个文件时的候选，用于提示歧义。 */
    candidates(file: string): string[];
}
export declare function createFileResolver(files: readonly string[]): FileResolver;
/**
 * 组件链上的 props（由内到外）。
 *
 * 用途：配置驱动的页面把「这一页是哪个 schema」写在 `SchemaPage` 的 props 里，
 * 只有拿到 props 才能把「渲染壳」补成「页面定义在哪里」。
 */
export declare function instanceProps(element: Element, limit?: number): Array<Record<string, unknown>>;
/** 同一 basename 对应的全部源码文件（生产构建压成 basename 时用来提示歧义）。 */
export declare function filesNamed(files: readonly string[], basename: string): string[];
export interface ChainOptions {
    /** 路径还原器（通常来自 `createFileResolver`）；不给就只做归一化。 */
    resolve?: FileResolver;
    /** 最多向上走多少层，防止异常链死循环。 */
    limit?: number;
}
/**
 * 组件链：从承载 DOM 的实例一路向上，回答「这一块是谁渲染的」。
 *
 * 由内到外返回，调用方可以直接把最后一项当页面组件。
 */
export declare function componentChain(element: Element, options?: ChainOptions): ComponentFrame[];
