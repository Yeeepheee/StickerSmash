import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './MyWidgetRenderer.types';

type MyWidgetRendererModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class MyWidgetRendererModule extends NativeModule<MyWidgetRendererModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(MyWidgetRendererModule, 'MyWidgetRendererModule');
