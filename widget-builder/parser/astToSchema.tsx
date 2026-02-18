export function astToSchema(ast: any): any {
  if (!ast) throw new Error("Invalid AST");
  if (!["vstack", "hstack"].includes(ast.type)) throw new Error("Root element must be VStack or HStack");

  return {
    layout: ast.type,
    backgroundColor: ast.props?.background || "#ffffff",
    children: convertChildren(ast.children || []),
  };
}

function convertChildren(children: any[]): any[] {
  return children.map(convertNode).filter(Boolean);
}

function convertNode(node: any) {
  if (!node) return null;

  switch (node.type) {
    case "text":
      return convertText(node);
    case "spacer":
      return { type: "spacer" };
    default:
      throw new Error(`Unsupported tag: <${node.type}>`);
  }
}

function convertText(node: any) {
  const textChild = node.children?.find(
    (c: any) =>
      (c.type === "textNode" && c.value) ||
      (c.type === "JSXText" && c.value) ||
      (c.type === "Literal" && c.value)
  );

  const value = textChild?.value?.trim() || "";

  return {
    type: "text",
    value,
    fontSize: Number(node.props?.fontsize || 16),
    color: node.props?.color || "#000000",
    alignment: node.props?.alignment || "center",
  };
}
