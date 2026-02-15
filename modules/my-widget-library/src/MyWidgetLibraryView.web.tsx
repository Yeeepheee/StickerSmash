import * as React from 'react';

import { MyWidgetLibraryViewProps } from './MyWidgetLibrary.types';

export default function MyWidgetLibraryView(props: MyWidgetLibraryViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
