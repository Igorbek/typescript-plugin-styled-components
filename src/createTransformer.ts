import * as ts from 'typescript';
import {
    isPropertyAccessExpression,
    isCallExpression,
    isIdentifier,
    isVariableDeclaration,
    isExportAssignment,
    isTaggedTemplateExpression,
} from './ts-is-kind';

import {Options} from './models/Options';

/** Detects that a node represents a styled function
 * Recognizes the following patterns:
 *
 * styled.tag
 * Component.extend
 * styled(Component)
 * styledFunction.attrs(attributes)
*/
function isStyledFunction(node: ts.Node): boolean {
    if (isPropertyAccessExpression(node)) {
        if (isStyledObject(node.expression)) {
            return true;
        }

        if (node.name.text === 'extend'
            && isValidComponent(node.expression)) {

            return true;
        }

        return false;
    }

    if (isCallExpression(node) && node.arguments.length === 1) {

        if (isStyledObject(node.expression)) {
            return true;
        }

        if (isStyledAttrs(node.expression)) {
            return true;
        }
    }

    return false;
}

function isStyledObject(node: ts.Node) {
    return node && isIdentifier(node) && node.text === 'styled';
}

function isValidComponent(node: ts.Node) {
    return node && isIdentifier(node) && isValidComponentName(node.text);
}

function isValidTagName(name: string) {
    return name[0] === name[0].toLowerCase();
}

function isValidComponentName(name: string) {
    return name[0] === name[0].toUpperCase();
}

function isStyledAttrs(node: ts.Node) {
    return node && isPropertyAccessExpression(node)
        && node.name.text === 'attrs'
        && isStyledFunction((node as ts.PropertyAccessExpression).expression);
}

function defaultGetDisplayName(filename: string, bindingName: string | undefined): string | undefined {
    return bindingName;
}

export function createTransformer(options?: Partial<Options>): ts.TransformerFactory<ts.SourceFile>
export function createTransformer({ getDisplayName = defaultGetDisplayName }: Partial<Options> = {}) {
    /**
     * Infers display name of a styled component.
     * Recognizes the following patterns:
     *
     * (const|var|let) ComponentName = styled...
     * export default styled...
    */
    function getDisplayNameFromNode(node: ts.Node): string | undefined {
        if (isVariableDeclaration(node) && isIdentifier(node.name)) {
            return getDisplayName(node.getSourceFile().fileName, node.name.text);
        }

        if (isExportAssignment(node)) {
            return getDisplayName(node.getSourceFile().fileName, undefined);
        }

        return undefined;
    }

    const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
        const visitor: ts.Visitor = (node) => {
            if (node.parent

                && isTaggedTemplateExpression(node.parent)
                && node.parent.tag === node
                && node.parent.parent
                && isVariableDeclaration(node.parent.parent)
                && isStyledFunction(node)) {

                const displayName = getDisplayNameFromNode(node.parent.parent);

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

    return transformer;
}

export default createTransformer;
