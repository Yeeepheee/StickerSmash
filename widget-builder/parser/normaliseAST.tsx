// normaliseAST.tsx
export function normaliseAST(node: any, parentType?: string): any | null {
  if (!node) return null;

  // Convert raw JSX text to textNode (just in case)
  if (["JSXText", "Literal"].includes(node.type) && node.value?.trim()) {
    return { type: "textNode", value: node.value.trim() };
  }

  // Wrap textNode in <text> ONLY if it's not already inside a <text> tag
  if (node.type === "textNode") {
    if (parentType === "text") {
      return node; // Leave it alone, it's already inside <Text>
    }
    // Otherwise, wrap naked text
    return {
      type: "text",
      props: { fontsize: 16, color: "#000000", alignment: "center" },
      children: [node],
    };
  }

  // Normalize children recursively, passing current node.type as parentType
  if (node.children?.length) {
    node.children = node.children
      .map((child: any) => normaliseAST(child, node.type))
      .filter(Boolean);
  }

  return node;
}