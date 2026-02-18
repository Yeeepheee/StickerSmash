// parseJSX.tsx
import { parseDocument } from "htmlparser2";

export function parseJSX(input: string) {
  const doc = parseDocument(input);

  function transform(node: any): any {
    if (node.type === "text") {
      const trimmed = node.data.trim();
      if (!trimmed) return null; // Ignore purely whitespace nodes
      return { type: "textNode", value: trimmed };
    }

    if (node.type === "tag") {
      return {
        type: node.name.toLowerCase(),
        props: node.attribs,
        children: node.children.map(transform).filter(Boolean),
      };
    }

    return null;
  }

  // Find the first actual layout tag, skipping root text/whitespace nodes
  const rootElements = doc.children.map(transform).filter(Boolean);
  const mainRoot = rootElements.find((n: any) => n.type === "vstack" || n.type === "hstack");
  
  return mainRoot || rootElements[0];
}