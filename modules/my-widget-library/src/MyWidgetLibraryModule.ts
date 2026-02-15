import { NativeModule, requireNativeModule } from 'expo';

import { MyWidgetLibraryModuleEvents } from './MyWidgetLibrary.types';

declare class MyWidgetLibraryModule extends NativeModule<MyWidgetLibraryModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<MyWidgetLibraryModule>('MyWidgetLibrary');
