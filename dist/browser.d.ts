import { type ComponentFrame, type SourceLocation } from './location.ts';
/** 当前页面的来源：谁提供了这一页（插件 / schema / 路由）。 */
export interface PageOrigin {
    /** 一句话结论，例如「配置驱动页面：schema demo.device」。 */
    label: string;
    /** 补充说明：具体文件或权限码，可省。 */
    detail?: string;
    /** 定义这一页的源码文件（相对路径）；给了就能点击跳转。 */
    files?: string[];
}
export interface PickerLabels {
    title: string;
    hint: string;
    empty: string;
    copy: string;
    copied: string;
    open: string;
    ambiguous: string;
    repo: string;
    page: string;
}
export interface PickedDetail {
    location: SourceLocation | null;
    chain: ComponentFrame[];
    /** 组件链上出现过的 schema key（配置驱动的页面把页面定义写在 `page-key` 里）。 */
    schemaKeys: string[];
    /** 组件链上出现过的路由名（容器组件把它写进 props 时才有）。 */
    routeNames: string[];
    /** 元素选择器路径，例如 `main .app-frame > section.page > h1`。 */
    path: string;
    /** 同一 basename 对应多个源码文件时的候选（生产构建会压成 basename）。 */
    candidates: string[];
}
export interface SourcePickerOptions {
    /** 切换快捷键；默认 `mod+shift+e`（macOS ⌘⇧E）。传 `null` 关闭。 */
    hotkey?: string | null;
    /** 本地 `.vue` 清单；默认读注入到 HTML 的那份。 */
    files?: () => string[];
    /** 仓库链接：给了就多一个「在仓库查看」。 */
    repo?: {
        baseUrl: string;
        branch?: string;
    };
    /** 打开编辑器的端点；默认 Vite 的 `/__open-in-editor`，传 `false` 关闭。 */
    editorEndpoint?: string | false;
    /** 选中回调；插件用它联动宿主（例如把结果推进右栏）。 */
    onPick?: (picked: PickedDetail) => void;
    /** 激活状态变化回调。 */
    onChange?: (active: boolean) => void;
    /**
     * 当前页面的来源说明（宿主提供）。
     *
     * 配置驱动的页面根本没有 `.vue`，光靠元素标记只能回答「渲染在哪个壳里」；
     * 由宿主补一句「这一页的配置来自哪里」，用户才不会在壳文件里翻业务逻辑。
     */
    describePage?: (picked: PickedDetail) => PageOrigin | null;
    labels?: Partial<PickerLabels>;
}
/** 读取注入到 HTML 的清单；没有就返回空数组（拾取器依然可用）。 */
export declare function readManifest(doc?: Document): string[];
/** 元素在 DOM 里的可读路径：用于人工确认「点的是哪一个」。 */
export declare function describePath(element: Element): string;
export interface SourcePicker {
    enable(): void;
    disable(): void;
    toggle(): void;
    readonly active: boolean;
    destroy(): void;
}
/**
 * 创建拾取器。默认不激活，调用 `enable()` 后才接管指针。
 *
 * 只捕获事件、不改页面 DOM：悬停画一个覆盖框，点击阻止默认行为并出卡片，
 * 滚动、键盘输入、表单交互都不受影响。
 */
export declare function createSourcePicker(options?: SourcePickerOptions): SourcePicker;
/** 仓库链接：`https://github.com/me/repo/blob/main/src/x.vue#L12`。 */
export declare function repoUrl(repo: {
    baseUrl: string;
    branch?: string;
}, location: SourceLocation): string;
