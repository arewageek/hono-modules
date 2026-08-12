import { Project, SyntaxKind } from 'ts-morph';
import path from 'node:path';
import fs from 'node:fs/promises';

export async function addModuleToRegistry(registryPath: string, moduleName: string) {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(registryPath);

  // Define the import and the variable names
  const importName = `${moduleName}Module`;
  const importPath = `./${moduleName}/module`;

  // 1. Add the import if it doesn't exist
  const existingImport = sourceFile.getImportDeclaration(
    (decl) => decl.getModuleSpecifierValue() === importPath
  );

  if (!existingImport) {
    sourceFile.addImportDeclaration({
      namedImports: [importName],
      moduleSpecifier: importPath,
    });
  }

  // 2. Find registry.register([ ... ])
  const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
  
  let registryCallFound = false;

  for (const callExpr of callExpressions) {
    const expression = callExpr.getExpression();
    if (expression.getKind() === SyntaxKind.PropertyAccessExpression) {
      const propAccess = expression.asKindOrThrow(SyntaxKind.PropertyAccessExpression);
      if (
        propAccess.getExpression().getText() === 'registry' &&
        propAccess.getName() === 'register'
      ) {
        registryCallFound = true;
        const args = callExpr.getArguments();
        const firstArg = args[0];
        if (firstArg && firstArg.getKind() === SyntaxKind.ArrayLiteralExpression) {
          const arrayLiteral = firstArg.asKindOrThrow(SyntaxKind.ArrayLiteralExpression);
          
          // Check if it's already in the array
          const elements = arrayLiteral.getElements();
          const alreadyExists = elements.some((el) => el.getText() === importName);
          
          if (!alreadyExists) {
            arrayLiteral.addElement(importName);
          }
        }
        break;
      }
    }
  }

  if (!registryCallFound) {
    throw new Error('Could not find registry.register([]) call in ' + registryPath);
  }

  // Format and save
  sourceFile.formatText();
  await sourceFile.save();
}
