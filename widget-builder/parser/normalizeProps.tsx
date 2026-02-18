export function normaliseProps(node: any) {
  if (!node.props) return;

  const newProps: Record<string, any> = {};
  Object.keys(node.props).forEach((key) => {
    newProps[key.toLowerCase()] = node.props[key];
  });
  node.props = newProps;

  if (node.children?.length) {
    node.children.forEach(normaliseProps);
  }
}
