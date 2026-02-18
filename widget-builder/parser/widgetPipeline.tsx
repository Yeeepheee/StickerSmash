// parser/widgetPipeline.ts

import { parseJSX } from "./parseJSX";
import { validateAST } from "./validator";
import { astToSchema } from "./astToSchema";
import { normaliseAST } from "./normaliseAST";
import { normaliseProps } from "./normalizeProps";

// -------------------------
// Build widget schema pipeline
// -------------------------
export function buildWidgetSchema(code: string) {
  // 1️⃣ Parse JSX → AST
  const ast = parseJSX(code);
  if (!ast) throw new Error("Failed to parse JSX");

  // // 2️⃣ Normalize props (lowercase keys)
  normaliseProps(ast);

  // 3️⃣ Normalize AST (convert raw text → textNode)
  const nAst = normaliseAST(ast);

  // 4️⃣ Validate AST (tags, props, children, text)
  validateAST(nAst);

  // 5️⃣ Convert AST → Widget JSON schema
  const schema = astToSchema(nAst);

  return schema;
}
