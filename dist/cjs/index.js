"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repoUrl = exports.describePath = exports.readManifest = exports.createSourcePicker = exports.SOURCE_LOCATOR_MANIFEST_ID = exports.SOURCE_LOCATOR_ATTRIBUTE = exports.sourceLocatorPlugin = exports.markSourceElements = exports.instanceProps = exports.filesNamed = exports.createFileResolver = exports.componentChain = exports.normalizeFile = exports.locateElement = exports.formatLocation = exports.parseLocation = exports.SOURCE_ATTRIBUTE = void 0;
// 浏览器元素拾取 → 源码位置：编译期标记 + 运行期拾取。
//
// 三层各管一件事，互不耦合：
// - `vite`：构建期把 `data-source-loc` 写进模板元素，并注入本地 `.vue` 清单；
// - `location`：DOM ↔ 源位置 / 组件链的纯函数，无框架依赖；
// - `browser`：Chrome 式拾取器（Shadow DOM 覆盖层 + 快捷键），零业务符号。
var location_ts_1 = require("./location.js");
Object.defineProperty(exports, "SOURCE_ATTRIBUTE", { enumerable: true, get: function () { return location_ts_1.SOURCE_ATTRIBUTE; } });
Object.defineProperty(exports, "parseLocation", { enumerable: true, get: function () { return location_ts_1.parseLocation; } });
Object.defineProperty(exports, "formatLocation", { enumerable: true, get: function () { return location_ts_1.formatLocation; } });
Object.defineProperty(exports, "locateElement", { enumerable: true, get: function () { return location_ts_1.locateElement; } });
Object.defineProperty(exports, "normalizeFile", { enumerable: true, get: function () { return location_ts_1.normalizeFile; } });
Object.defineProperty(exports, "componentChain", { enumerable: true, get: function () { return location_ts_1.componentChain; } });
Object.defineProperty(exports, "createFileResolver", { enumerable: true, get: function () { return location_ts_1.createFileResolver; } });
Object.defineProperty(exports, "filesNamed", { enumerable: true, get: function () { return location_ts_1.filesNamed; } });
Object.defineProperty(exports, "instanceProps", { enumerable: true, get: function () { return location_ts_1.instanceProps; } });
var vite_ts_1 = require("./vite.js");
Object.defineProperty(exports, "markSourceElements", { enumerable: true, get: function () { return vite_ts_1.markSourceElements; } });
Object.defineProperty(exports, "sourceLocatorPlugin", { enumerable: true, get: function () { return vite_ts_1.sourceLocatorPlugin; } });
Object.defineProperty(exports, "SOURCE_LOCATOR_ATTRIBUTE", { enumerable: true, get: function () { return vite_ts_1.SOURCE_LOCATOR_ATTRIBUTE; } });
Object.defineProperty(exports, "SOURCE_LOCATOR_MANIFEST_ID", { enumerable: true, get: function () { return vite_ts_1.SOURCE_LOCATOR_MANIFEST_ID; } });
var browser_ts_1 = require("./browser.js");
Object.defineProperty(exports, "createSourcePicker", { enumerable: true, get: function () { return browser_ts_1.createSourcePicker; } });
Object.defineProperty(exports, "readManifest", { enumerable: true, get: function () { return browser_ts_1.readManifest; } });
Object.defineProperty(exports, "describePath", { enumerable: true, get: function () { return browser_ts_1.describePath; } });
Object.defineProperty(exports, "repoUrl", { enumerable: true, get: function () { return browser_ts_1.repoUrl; } });
