import { NativeModule, requireNativeModule } from 'expo';

import { MyWidgetRendererModuleEvents } from './MyWidgetRenderer.types';

declare class MyWidgetRendererModule extends NativeModule<MyWidgetRendererModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<MyWidgetRendererModule>('MyWidgetRenderer');
