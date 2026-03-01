import { parseDocument } from "htmlparser2";

/**
 * CONFIGURATION: The "Source of Truth" for your widget DSL
 */
const CONFIG = {
  root: ["vstack", "hstack"],
  tags: {
    text: {
      allowedProps: ["fontsize", "color", "alignment"],
      defaults: { fontsize: 16, color: "#000000", alignment: "center" }
    },
    image: {
      allowedProps: ["src", "width", "height", "contentmode"],
      defaults: { width: 50, height: 50, contentmode: "fit" }
    },
    spacer: { allowedProps: [], defaults: {} }
  },
  globalProps: ["padding"], // Props allowed on all layout tags
  constraints: {
    maxChildren: 10,
    maxTextLength: 200,
    hexRegex: /^#([0-9A-F]{3}){1,2}$/i
  }
};

export function buildWidgetSchema(code: string) {
  const doc = parseDocument(code);
  
  const rootNode = doc.children.find(n => n.type === "tag") as any;
  if (!rootNode || !CONFIG.root.includes(rootNode.name.toLowerCase())) {
    throw new Error("Root element must be <VStack> or <HStack>");
  }

  const tagName = rootNode.name.toLowerCase();

  return {
    layout: tagName,
    backgroundColor: rootNode.attribs?.background || "#ffffff",
    padding: Number(rootNode.attribs?.padding || 0),
    children: transformChildren(rootNode.children)
  };
}

function transformChildren(children: any[]): any[] {
  if (children.length > CONFIG.constraints.maxChildren) {
    throw new Error(`Too many elements (max ${CONFIG.constraints.maxChildren})`);
  }

  return children
    .map(node => {
      if (node.type === "text") {
        const text = node.data.trim();
        return text ? wrapInTextSchema(text) : null;
      }

      const tagName = node.name.toLowerCase();

      // Handle Component Tags
      switch (tagName) {
        case "text":
          const textContent = node.children.map((c: any) => c.data || "").join("").trim();
          return wrapInTextSchema(textContent, node.attribs);
        
        case "image":
          return wrapInImageSchema(node.attribs);

        case "spacer":
          return { type: "spacer" };

        default:
          if (CONFIG.root.includes(tagName)) {
            throw new Error("Nested layouts are not supported");
          }
          throw new Error(`Unsupported tag <${tagName}>`);
      }
    })
    .filter(Boolean);
}

// Logic for <Text>
function wrapInTextSchema(value: string, rawProps: Record<string, string> = {}) {
  if (!value) throw new Error("<Text> cannot be empty");
  if (value.length > CONFIG.constraints.maxTextLength) throw new Error("Text too long");

  const props: any = { ...CONFIG.tags.text.defaults };
  
  Object.keys(rawProps).forEach(key => {
    const lowKey = key.toLowerCase();
    const val = rawProps[key];

    if (!CONFIG.tags.text.allowedProps.includes(lowKey)) {
      throw new Error(`Property "${key}" not allowed on <Text>`);
    }

    if (lowKey === "fontsize") {
      const num = Number(val);
      if (isNaN(num) || num < 10 || num > 40) throw new Error("fontSize must be 10-40");
      props.fontSize = num;
    } else if (lowKey === "color" && !CONFIG.constraints.hexRegex.test(val)) {
      throw new Error("Invalid hex color");
    } else {
      props[lowKey] = val;
    }
  });

  return { type: "text", value, ...props };
}

// Logic for <Image>
function wrapInImageSchema(rawProps: Record<string, string> = {}) {
  const props: any = { ...CONFIG.tags.image.defaults };

  if (!rawProps.src) throw new Error("<Image> requires a 'src' property");

  Object.keys(rawProps).forEach(key => {
    const lowKey = key.toLowerCase();
    if (CONFIG.tags.image.allowedProps.includes(lowKey)) {
      props[lowKey] = (lowKey === "width" || lowKey === "height") ? Number(rawProps[key]) : rawProps[key];
    }
  });

  return { type: "image", ...props };
}