import { requireNativeView } from 'expo';
import * as React from 'react';

import { MyWidgetLibraryViewProps } from './MyWidgetLibrary.types';

const NativeView: React.ComponentType<MyWidgetLibraryViewProps> =
  requireNativeView('MyWidgetLibrary');

export default function MyWidgetLibraryView(props: MyWidgetLibraryViewProps) {
  return <NativeView {...props} />;
}
