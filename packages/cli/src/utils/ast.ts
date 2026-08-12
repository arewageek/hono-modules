import { Project, SyntaxKind } from 'ts-morph';

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

  // 2. Find registerModules function and its return statement
  const func = sourceFile.getFunction('registerModules');
  if (!func) {
    throw new Error('Could not find registerModules() function in ' + registryPath);
  }

  const returnStmt = func.getDescendantsOfKind(SyntaxKind.ReturnStatement)[0];
  if (!returnStmt) {
    throw new Error('Could not find return statement in registerModules()');
  }

  const expression = returnStmt.getExpression();
  if (!expression) {
    throw new Error('Return statement has no expression');
  }

  const text = expression.getText();
  
  // Check if it already has this route
  if (!text.includes(`${importName}.routes`)) {
    expression.replaceWithText(`${text}\n    .route('/${moduleName}', ${importName}.routes)`);
  }

  // Format and save
  sourceFile.formatText();
  await sourceFile.save();
}
