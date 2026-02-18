import { requireNativeView } from 'expo';
import * as React from 'react';

import { MyWidgetRendererViewProps } from './MyWidgetRenderer.types';

const NativeView: React.ComponentType<MyWidgetRendererViewProps> =
  requireNativeView('MyWidgetRenderer');

export default function MyWidgetRendererView(props: MyWidgetRendererViewProps) {
  return <NativeView {...props} />;
}
