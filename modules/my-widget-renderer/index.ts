// Reexport the native module. On web, it will be resolved to MyWidgetRendererModule.web.ts
// and on native platforms to MyWidgetRendererModule.ts
export { default } from './src/MyWidgetRendererModule';
export { default as MyWidgetRendererView } from './src/MyWidgetRendererView';
export * from  './src/MyWidgetRenderer.types';
