import * as path from 'path';
import * as ts from 'typescript';
import {
    isPropertyAccessExpression,
    isCallExpression,
    isIdentifier,
    isVariableDeclaration,
    isExportAssignment,
    isTaggedTemplateExpression,
} from './ts-is-kind';

import { Options, CustomStyledIdentifiers } from './models/Options';
import { hash } from './hash';
import { minifyTemplate } from './minify';

/** Detects that a node represents a styled function
 * Recognizes the following patterns:
 *
 * styled.tag
 * Component.extend
 * styled(Component)
 * styled('tag')
 * styledFunction.attrs(attributes)
*/
function isStyledFunction(node: ts.Node, identifiers: CustomStyledIdentifiers): boolean {
    if (isPropertyAccessExpression(node)) {
        if (isStyledObject(node.expression, identifiers)) {
            return true;
        }

        if (isStyledExtendIdentifier(node.name.text, identifiers)
            && isValidComponent(node.expression)) {
            return true;
        }

        return false;
    }

    if (isCallExpression(node) && node.arguments.length === 1) {

        if (isStyledObject(node.expression, identifiers)) {
            return true;
        }

        if (isStyledAttrs(node.expression, identifiers)) {
            return true;
        }
    }

    return false;
}

function isStyledObjectIdentifier(name: string, { styled: styledIdentifiers = ['styled'] }: CustomStyledIdentifiers) {
    return styledIdentifiers.indexOf(name) >= 0;
}

function isStyledObject(node: ts.Node, identifiers: CustomStyledIdentifiers) {
    return node && isIdentifier(node) && isStyledObjectIdentifier(node.text, identifiers);
}

function isValidComponent(node: ts.Node) {
    return node && isIdentifier(node) && isValidComponentName(node.text);
}

function isLetter(ch: string) {
    return ch.toLowerCase() !== ch.toUpperCase();
}

function isValidTagName(name: string) {
    return isLetter(name[0]) && name[0] === name[0].toLowerCase();
}

function isValidComponentName(name: string) {
    return isLetter(name[0]) && (name[0] === name[0].toUpperCase());
}

function isStyledAttrsIdentifier(name: string, { attrs: attrsIdentifiers = ['attrs'] }: CustomStyledIdentifiers) {
    return attrsIdentifiers.indexOf(name) >= 0;
}

function isStyledAttrs(node: ts.Node, identifiers: CustomStyledIdentifiers) {
    return node && isPropertyAccessExpression(node)
        && isStyledAttrsIdentifier(node.name.text, identifiers)
        && isStyledFunction((node as ts.PropertyAccessExpression).expression, identifiers);
}

function isStyledKeyframesIdentifier(name: string, { keyframes = ['keyframes'] }: CustomStyledIdentifiers) {
    return keyframes.indexOf(name) >= 0;
}

function isStyledCssIdentifier(name: string, { css = ['css'] }: CustomStyledIdentifiers) {
    return css.indexOf(name) >= 0;
}

function isStyledCreateGlobalStyleIdentifier(name: string, { createGlobalStyle = ['createGlobalStyle'] }: CustomStyledIdentifiers) {
    return createGlobalStyle.indexOf(name) >= 0;
}

function isStyledExtendIdentifier(name: string, { extend = [] }: CustomStyledIdentifiers) {
    return extend.indexOf(name) >= 0;
}

function isMinifyableStyledFunction(node: ts.Node, identifiers: CustomStyledIdentifiers) {
    return isStyledFunction(node, identifiers)
        || (
            isIdentifier(node)
            && (
                isStyledKeyframesIdentifier(node.text, identifiers)
                || isStyledCssIdentifier(node.text, identifiers)
                || isStyledCreateGlobalStyleIdentifier(node.text, identifiers)
            )
        );
}

function defaultGetDisplayName(filename: string, bindingName: string | undefined): string | undefined {
    return bindingName;
}

export function createTransformer(options?: Partial<Options>): ts.TransformerFactory<ts.SourceFile>
export function createTransformer({
    getDisplayName = defaultGetDisplayName,
    identifiers = {},
    ssr = true,
    displayName = true,
    minify = false
} : Partial<Options> = {}) {

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

    function getIdFromNode(node: ts.Node, sourceRoot: string | undefined, position: number): string | undefined {
        if ((isVariableDeclaration(node) && isIdentifier(node.name)) || isExportAssignment(node)) {
            const fileName = node.getSourceFile().fileName;
            const filePath = sourceRoot ? path.relative(sourceRoot, fileName).replace(path.sep, path.posix.sep) : fileName;
            return 'sc-' + hash(`${getDisplayNameFromNode(node)}${filePath}${position}`);
        }
        return undefined;
    }

    const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
        const { sourceRoot } = context.getCompilerOptions();

        return (node) => {
            let lastComponentPosition = 0;

            const visitor: ts.Visitor = (node) => {
                if (
                    minify
                    && isTaggedTemplateExpression(node)
                    && isMinifyableStyledFunction(node.tag, identifiers)
                ) {
                    const minifiedTemplate = minifyTemplate(node.template);
                    if (minifiedTemplate && minifiedTemplate !== node.template) {
                        const newNode = ts.createTaggedTemplate(node.tag, node.typeArguments, minifiedTemplate);
                        newNode.parent = node.parent;
                        node = newNode;
                    }
                }

                if (
                    node.parent
                    && (
                        isTaggedTemplateExpression(node.parent) && node.parent.tag === node
                        || isCallExpression(node.parent)
                    )
                    && node.parent.parent
                    && isVariableDeclaration(node.parent.parent)
                    && isStyledFunction(node, identifiers)
                ) {

                    const styledConfig = [];

                    if (displayName) {
                        const displayNameValue = getDisplayNameFromNode(node.parent.parent);
                        if (displayNameValue) {
                            styledConfig.push(ts.createPropertyAssignment('displayName', ts.createLiteral(displayNameValue)));
                        }                    
                    }

                    if (ssr) {
                        const componentId = getIdFromNode(node.parent.parent, sourceRoot, ++lastComponentPosition);
                        if (componentId) {
                            styledConfig.push(ts.createPropertyAssignment('componentId', ts.createLiteral(componentId))); 
                        }                                           
                    }

                    if (styledConfig.length > 0) {
                        return ts.createCall(
                            ts.createPropertyAccess(node as ts.Expression, 'withConfig'),
                            undefined,
                            [ts.createObjectLiteral(styledConfig)]);
                    }
                }

                ts.forEachChild(node, n => {
                    if (!n.parent)
                        n.parent = node;
                });

                return ts.visitEachChild(node, visitor, context);
            }

            return ts.visitNode(node, visitor);
        };
    };

    return transformer;
}

export default createTransformer;
