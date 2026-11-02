export { SOURCE_ATTRIBUTE, parseLocation, formatLocation, locateElement, normalizeFile, componentChain, createFileResolver, filesNamed, instanceProps } from './location.ts';
export type { ComponentFrame, SourceLocation, PickedElement, ChainOptions, FileResolver } from './location.ts';
export { markSourceElements, sourceLocatorPlugin, SOURCE_LOCATOR_ATTRIBUTE, SOURCE_LOCATOR_MANIFEST_ID } from './vite.ts';
export type { SourceLocatorOptions } from './vite.ts';
export { createSourcePicker, readManifest, describePath, repoUrl } from './browser.ts';
export type { SourcePicker, SourcePickerOptions, PickedDetail, PickerLabels, PageOrigin } from './browser.ts';
