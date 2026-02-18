const ALLOWED_ROOT = ["vstack", "hstack"];
const ALLOWED_CHILDREN = ["text", "spacer"];
const ALLOWED_PROPS: Record<string, string[]> = {
  vstack: ["background"],
  hstack: ["background"],
  text: ["fontsize", "color", "alignment"], // lowercase!
  spacer: [],
};
const MAX_CHILDREN = 10;

export function validateAST(ast: any) {
  if (!ast) throw new Error("Empty widget definition");
  validateRoot(ast);
}

function validateRoot(node: any) {
  if (!ALLOWED_ROOT.includes(node.type)) {
    throw new Error("Root element must be <VStack> or <HStack>");
  }
  validateProps(node);
  validateChildren(node.children || []);
}

function validateChildren(children: any[]) {
  if (children.length > MAX_CHILDREN) throw new Error("Too many elements in widget");
  children.forEach(validateNode);
}

function validateNode(node: any) {
  if (!ALLOWED_CHILDREN.includes(node.type)) {
    throw new Error(`Unsupported tag <${node.type}>`);
  }

  validateProps(node);

  if (node.type === "text") validateTextNode(node);

  // Prevent nested layouts
  if (node.children) {
    const nestedLayout = node.children.find((c: any) => c.type === "vstack" || c.type === "hstack");
    if (nestedLayout) throw new Error("Nested layouts are not supported");
  }
}

function validateTextNode(node: any) {
  if (!node.children?.length) return;

  const textChild = node.children.find(
    (c: any) =>
      (c.type === "textNode" && c.value?.trim()) ||
      (c.type === "JSXText" && c.value?.trim()) ||
      (c.type === "Literal" && c.value?.trim())
  );

  if (!textChild) return;

  const value = textChild.value?.trim();
  if (!value) throw new Error("<Text> must contain text");
  if (value.length > 200) throw new Error("Text too long (max 200 characters)");
}

function validateProps(node: any) {
  const allowed = ALLOWED_PROPS[node.type] || [];
  if (!node.props) return;

  Object.keys(node.props).forEach((prop) => {
    if (!allowed.includes(prop)) {
      throw new Error(`Property "${prop}" not allowed on <${node.type}>`);
    }
    validatePropValue(node.type, prop, node.props[prop]);
  });
}

function validatePropValue(tag: string, prop: string, value: any) {
  if (tag === "text") {
    if (prop === "fontsize") {
      const size = Number(value);
      if (isNaN(size) || size < 10 || size > 40) throw new Error("fontSize must be between 10 and 40");
    }
    if (prop === "color") {
      if (!/^#([0-9A-F]{3}){1,2}$/i.test(value)) throw new Error("Invalid hex color format");
    }
    if (prop === "alignment") {
      if (!["leading", "center", "trailing"].includes(value)) throw new Error("alignment must be leading, center, or trailing");
    }
  }

  if (tag === "vstack" || tag === "hstack") {
    if (prop === "background") {
      if (!/^#([0-9A-F]{3}){1,2}$/i.test(value)) throw new Error("Invalid background color");
    }
  }
}
