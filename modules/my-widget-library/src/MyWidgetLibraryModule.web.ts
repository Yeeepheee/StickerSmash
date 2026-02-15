import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './MyWidgetLibrary.types';

type MyWidgetLibraryModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class MyWidgetLibraryModule extends NativeModule<MyWidgetLibraryModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(MyWidgetLibraryModule, 'MyWidgetLibraryModule');
