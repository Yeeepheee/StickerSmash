import * as React from 'react';

import { MyWidgetRendererViewProps } from './MyWidgetRenderer.types';

export default function MyWidgetRendererView(props: MyWidgetRendererViewProps) {
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
