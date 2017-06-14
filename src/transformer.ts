import * as ts from 'typescript';

/*
Transforms:
  (const | let | var) <name> = <styled>`` -> 
*/

/** Detects that a node represents a styled function
 * Recognizes the following patterns:
 * styled.tag
 * Component.extend
 * styled(Component)
 * styledFunction.attrs(attributes)
*/
function isStyledFunction(node: ts.Node): boolean {
    if (node.kind === ts.SyntaxKind.PropertyAccessExpression
        && (node as ts.PropertyAccessExpression).expression.kind === ts.SyntaxKind.Identifier) {
        const propertyName = (node as ts.PropertyAccessExpression).name.text;
        const objectName = ((node as ts.PropertyAccessExpression).expression as ts.Identifier).text;

        return propertyName === 'extend'
            ? objectName[0] === objectName[0].toUpperCase()
            : objectName === 'styled';
    }

    return false;
}

function getDisplayName(node: ts.Node): string | undefined {
    if (node.kind === ts.SyntaxKind.VariableDeclaration
        && (node as ts.VariableDeclaration).name.kind === ts.SyntaxKind.Identifier) {
        return ((node as ts.VariableDeclaration).name as ts.Identifier).text;
    }

    if (node.kind === ts.SyntaxKind.ExportAssignment) {

    }

    return undefined;
}

const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    const visitor: ts.Visitor = (node) => {
        if (node.parent
            && node.parent.kind === ts.SyntaxKind.TaggedTemplateExpression
            && (node.parent as ts.TaggedTemplateExpression).tag === node
            && node.parent.parent
            && node.parent.parent.kind === ts.SyntaxKind.VariableDeclaration
            && isStyledFunction(node)) {

            const displayName = getDisplayName(node.parent.parent);

            if (displayName) {
                return ts.createCall(
                    ts.createPropertyAccess(node as ts.Expression, 'withConfig'),
                    undefined,
                    [ts.createObjectLiteral([ts.createPropertyAssignment('displayName', ts.createLiteral(displayName))])]);
            }
        }

        return ts.visitEachChild(node, visitor, context);
    }

    return (node) => ts.visitNode(node, visitor);
};

export default transformer;
