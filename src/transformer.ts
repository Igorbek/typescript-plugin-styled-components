import * as ts from 'typescript';

/** Detects that a node represents a styled function
 * Recognizes the following patterns:
 * 
 * styled.tag
 * Component.extend
 * styled(Component)
 * styledFunction.attrs(attributes)
*/
function isStyledFunction(node: ts.Node): boolean {
    if (node.kind === ts.SyntaxKind.PropertyAccessExpression) {
        if (isStyledObject((node as ts.PropertyAccessExpression).expression)) {
            return true;
        }

        if ((node as ts.PropertyAccessExpression).name.text === 'extend'
            && isValidComponent((node as ts.PropertyAccessExpression).expression)) {

            return true;
        }

        return false;
    }

    if (node.kind === ts.SyntaxKind.CallExpression
        && (node as ts.CallExpression).arguments.length === 1) {

        if (isStyledObject((node as ts.CallExpression).expression)) {
            return true;
        }

        if (isStyledAttrs((node as ts.CallExpression).expression)) {
            return true;
        }
    }

    return false;
}

function isStyledObject(node: ts.Node) {
    return node && node.kind === ts.SyntaxKind.Identifier && (node as ts.Identifier).text === 'styled';
}

function isValidComponent(node: ts.Node) {
    return node && node.kind === ts.SyntaxKind.Identifier && isValidComponentName((node as ts.Identifier).text);
}

function isValidTagName(name: string) {
    return name[0] === name[0].toLowerCase();
}

function isValidComponentName(name: string) {
    return name[0] === name[0].toUpperCase();
}

function isStyledAttrs(node: ts.Node) {
    return node && node.kind === ts.SyntaxKind.PropertyAccessExpression
        && (node as ts.PropertyAccessExpression).name.text === 'attrs'
        && isStyledFunction((node as ts.PropertyAccessExpression).expression);
}

/**
 * Infers display name of a styled component.
 * Recognizes the following patterns:
 *
 * (const|var|let) ComponentName = styled...
 * export default styled...
*/
function getDisplayName(node: ts.Node): string | undefined {
    if (node.kind === ts.SyntaxKind.VariableDeclaration
        && (node as ts.VariableDeclaration).name.kind === ts.SyntaxKind.Identifier) {
        return ((node as ts.VariableDeclaration).name as ts.Identifier).text;
    }

    if (node.kind === ts.SyntaxKind.ExportAssignment) {
        // todo: infer display name from file name
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

        ts.forEachChild(node, n => {
            if (!n.parent)
                n.parent = node;
        });

        return ts.visitEachChild(node, visitor, context);
    }

    return (node) => ts.visitNode(node, visitor);
};

export default transformer;
