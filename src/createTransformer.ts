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

        if (node.name.text === 'extend'
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
    function getDisplayNameFromNode(node: ts.Node, sourceFile: ts.SourceFile): string | undefined {
        if (isVariableDeclaration(node) && isIdentifier(node.name)) {
            return getDisplayName(sourceFile.fileName, node.name.text);
        }

        if (isExportAssignment(node)) {
            return getDisplayName(sourceFile.fileName, undefined);
        }

        return undefined;
    }

    function getIdFromNode(node: ts.Node, sourceRoot: string | undefined, position: number, sourceFile: ts.SourceFile): string | undefined {
        if ((isVariableDeclaration(node) && isIdentifier(node.name)) || isExportAssignment(node)) {
            const fileName = sourceFile.fileName;
            const filePath = sourceRoot ? path.relative(sourceRoot, fileName).replace(path.sep, path.posix.sep) : fileName;
            return 'sc-' + hash(`${getDisplayNameFromNode(node, sourceFile)}${filePath}${position}`);
        }
        return undefined;
    }

    const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
        const { sourceRoot } = context.getCompilerOptions();

        return (node) => {
            let lastComponentPosition = 0;
            const sourceFile = node.getSourceFile();

            const visitor = (parent: ts.Node, parentParent?: ts.Node): ts.Visitor => (node: ts.Node) => {
                if (
                    minify
                    && isTaggedTemplateExpression(node)
                    && isMinifyableStyledFunction(node.tag, identifiers)
                ) {
                    const minifiedTemplate = minifyTemplate(node.template);
                    if (minifiedTemplate && minifiedTemplate !== node.template) {
                        node = ts.createTaggedTemplate(node.tag, node.typeArguments, minifiedTemplate);
                    }
                }

                if (
                    parent
                    && (
                        isTaggedTemplateExpression(parent) && parent.tag === node
                        || isCallExpression(parent)
                    )
                    && parentParent
                    && isVariableDeclaration(parentParent)
                    && isStyledFunction(node, identifiers)
                ) {

                    const styledConfig = [];

                    if (displayName) {
                        const displayNameValue = getDisplayNameFromNode(parentParent, sourceFile);
                        if (displayNameValue) {
                            styledConfig.push(ts.createPropertyAssignment('displayName', ts.createLiteral(displayNameValue)));
                        }
                    }

                    if (ssr) {
                        const componentId = getIdFromNode(parentParent, sourceRoot, ++lastComponentPosition, sourceFile);
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

                return ts.visitEachChild(node, visitor(node, parent), context);
            }

            return ts.visitNode(node, visitor(node.parent));
        };
    };

    return transformer;
}

export default createTransformer;
