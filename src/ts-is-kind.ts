// The source code is kindly borrowed from `ts-is-kind` npm module.
// Original repo: https://github.com/mohsen1/ts-is-kind by @mohsen1

import * as ts from 'typescript';

/**
 * Return true if node is `PropertyAccessExpression`
 * @param node A TypeScript node
 */
export function isPropertyAccessExpression(node: ts.Node): node is ts.PropertyAccessExpression {
    return node.kind === ts.SyntaxKind.PropertyAccessExpression;
}

/**
 * Return true if node is `CallExpression`
 * @param node A TypeScript node
 */
export function isCallExpression(node: ts.Node): node is ts.CallExpression {
    return node.kind === ts.SyntaxKind.CallExpression;
}

/**
 * Return true if node is `Identifier`
 * @param node A TypeScript node
 */
export function isIdentifier(node: ts.Node): node is ts.Identifier {
    return node.kind === ts.SyntaxKind.Identifier;
}

/**
 * Return true if node is `VariableDeclaration`
 * @param node A TypeScript node
 */
export function isVariableDeclaration(node: ts.Node): node is ts.VariableDeclaration {
    return node.kind === ts.SyntaxKind.VariableDeclaration;
}

/**
 * Return true if node is `ExportAssignment`
 * @param node A TypeScript node
 */
export function isExportAssignment(node: ts.Node): node is ts.ExportAssignment {
    return node.kind === ts.SyntaxKind.ExportAssignment;
}

/**
 * Return true if node is `TaggedTemplateExpression`
 * @param node A TypeScript node
 */
export function isTaggedTemplateExpression(node: ts.Node): node is ts.TaggedTemplateExpression {
    return node.kind === ts.SyntaxKind.TaggedTemplateExpression;
}

/**
 * Return true if node is `TemplateExpression`
 * @param node A TypeScript node
 */
export function isTemplateExpression(node: ts.Node): node is ts.TemplateExpression {
    return node.kind === ts.SyntaxKind.TemplateExpression;
}

/**
 * Return true if node is `NoSubstitutionTemplateLiteral`
 * @param node A TypeScript node
 */
export function isNoSubstitutionTemplateLiteral(node: ts.Node): node is ts.NoSubstitutionTemplateLiteral {
    return node.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral;
}
