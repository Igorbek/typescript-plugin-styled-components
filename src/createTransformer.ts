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
function isStyledFunction(
    node: ts.Node,
    identifiers: CustomStyledIdentifiers
): node is ts.PropertyAccessExpression | ts.CallExpression {
    if (isPropertyAccessExpression(node)) {
        if (isStyledObject(node.expression, identifiers)) {
            return true;
        }

        if (isStyledExtendIdentifier(node.name.text, identifiers) && isValidComponent(node.expression)) {
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
    return isLetter(name[0]) && name[0] === name[0].toUpperCase();
}

function isStyledAttrsIdentifier(name: string, { attrs: attrsIdentifiers = ['attrs'] }: CustomStyledIdentifiers) {
    return attrsIdentifiers.indexOf(name) >= 0;
}

function isStyledAttrs(node: ts.Node, identifiers: CustomStyledIdentifiers) {
    return (
        node &&
        isPropertyAccessExpression(node) &&
        isStyledAttrsIdentifier(node.name.text, identifiers) &&
        isStyledFunction((node as ts.PropertyAccessExpression).expression, identifiers)
    );
}

function isStyledKeyframesIdentifier(name: string, { keyframes = ['keyframes'] }: CustomStyledIdentifiers) {
    return keyframes.indexOf(name) >= 0;
}

function isStyledCssIdentifier(name: string, { css = ['css'] }: CustomStyledIdentifiers) {
    return css.indexOf(name) >= 0;
}

function isStyledCreateGlobalStyleIdentifier(
    name: string,
    { createGlobalStyle = ['createGlobalStyle'] }: CustomStyledIdentifiers
) {
    return createGlobalStyle.indexOf(name) >= 0;
}

function isStyledExtendIdentifier(name: string, { extend = [] }: CustomStyledIdentifiers) {
    return extend.indexOf(name) >= 0;
}

function isMinifyableStyledFunction(node: ts.Node, identifiers: CustomStyledIdentifiers) {
    return (
        isStyledFunction(node, identifiers) ||
        (isIdentifier(node) &&
            (isStyledKeyframesIdentifier(node.text, identifiers) ||
                isStyledCssIdentifier(node.text, identifiers) ||
                isStyledCreateGlobalStyleIdentifier(node.text, identifiers)))
    );
}

function defaultGetDisplayName(filename: string, bindingName: string | undefined): string | undefined {
    return bindingName;
}

export function createTransformer(options?: Partial<Options>): ts.TransformerFactory<ts.SourceFile>;
export function createTransformer({
    getDisplayName = defaultGetDisplayName,
    identifiers = {},
    ssr = true,
    displayName = true,
    minify = false,
    componentIdPrefix = ''
}: Partial<Options> = {}) {
    /**
     * Infers display name of a styled component.
     * Recognizes the following patterns:
     *
     * (const|var|let) ComponentName = styled...
     * export default styled...
     */
    function getDisplayNameFromNode(node: ts.Node, sourceFile: ts.SourceFile): string | undefined {
        if (isVariableDeclaration(node) && isIdentifier(node.name)) {
            return (componentIdPrefix ? componentIdPrefix + '-' : '') + getDisplayName(sourceFile.fileName, node.name.text);
        }

        if (isExportAssignment(node)) {
            return getDisplayName(sourceFile.fileName, undefined);
        }

        return undefined;
    }

    function getIdFromNode(
        node: ts.Node,
        sourceRoot: string | undefined,
        position: number,
        sourceFile: ts.SourceFile
    ): string | undefined {
        if ((isVariableDeclaration(node) && isIdentifier(node.name)) || isExportAssignment(node)) {
            const fileName = sourceFile.fileName;
            const filePath = sourceRoot
                ? path.relative(sourceRoot, fileName).replace(path.sep, path.posix.sep)
                : fileName;
            return (componentIdPrefix || 'sc') + '-' + hash(`${getDisplayNameFromNode(node, sourceFile)}${filePath}${position}`);
        }
        return undefined;
    }

    const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
        const { sourceRoot } = context.getCompilerOptions();

        return (sourceFile) => {
            let lastComponentPosition = 0;

            const withConfig = (node: ts.Expression, properties: ts.PropertyAssignment[]) =>
                properties.length > 0
                    ? context.factory.createCallExpression(
                          context.factory.createPropertyAccessExpression(node, 'withConfig'),
                          undefined,
                          [context.factory.createObjectLiteralExpression(properties)]
                      )
                    : node;

            const createDisplayNameConfig = (displayNameValue: string | undefined) =>
                displayNameValue
                    ? [
                          context.factory.createPropertyAssignment(
                              'displayName',
                              context.factory.createStringLiteral(displayNameValue)
                          ),
                      ]
                    : [];
            const createIdConfig = (componentId: string | undefined) =>
                componentId
                    ? [
                          context.factory.createPropertyAssignment(
                              'componentId',
                              context.factory.createStringLiteral(componentId)
                          ),
                      ]
                    : [];

            const transformStyledFunction = (
                binding: ts.VariableDeclaration | ts.ExportAssignment,
                node: ts.Expression
            ) =>
                withConfig(node, [
                    ...(displayName ? createDisplayNameConfig(getDisplayNameFromNode(binding, sourceFile)) : []),
                    ...(ssr
                        ? createIdConfig(getIdFromNode(binding, sourceRoot, ++lastComponentPosition, sourceFile))
                        : []),
                ]);

            const transformTemplateLiteral = (templateLiteral: ts.TemplateLiteral) =>
                minify ? minifyTemplate(templateLiteral, context.factory) : templateLiteral;

            const transformTaggedTemplateExpression = (node: ts.TaggedTemplateExpression) =>
                isMinifyableStyledFunction(node.tag, identifiers)
                    ? context.factory.updateTaggedTemplateExpression(
                          node,
                          node.tag,
                          node.typeArguments,
                          transformTemplateLiteral(node.template)
                      )
                    : node;

            const transformBindingExpression = (
                binding: ts.VariableDeclaration | ts.ExportAssignment,
                node: ts.Expression
            ) => {
                if (isTaggedTemplateExpression(node) && isStyledFunction(node.tag, identifiers)) {
                    return context.factory.updateTaggedTemplateExpression(
                        node,
                        transformStyledFunction(binding, node.tag),
                        node.typeArguments,
                        transformTemplateLiteral(node.template)
                    );
                }
                if (isCallExpression(node) && isStyledFunction(node.expression, identifiers)) {
                    return context.factory.updateCallExpression(
                        node,
                        transformStyledFunction(binding, node.expression),
                        node.typeArguments,
                        node.arguments
                    );
                }
            };

            const updateNode = <T extends ts.Node, D>(
                node: T,
                data: D | undefined,
                updateFn: (node: T, data: D) => T
            ) => (data ? updateFn(node, data) : undefined);

            const updateVariableDeclarationInitializer = (node: ts.VariableDeclaration, initializer: ts.Expression) =>
                context.factory.updateVariableDeclaration(
                    node,
                    node.name,
                    node.exclamationToken,
                    node.type,
                    initializer
                );

            const updateExportAssignmentExpression = (node: ts.ExportAssignment, expression: ts.Expression) =>
                context.factory.updateExportAssignment(node, node.modifiers, expression);

            const transformNode = (node: ts.Node) =>
                isVariableDeclaration(node) && node.initializer
                    ? updateNode(
                          node,
                          transformBindingExpression(node, node.initializer),
                          updateVariableDeclarationInitializer
                      )
                    : isExportAssignment(node)
                    ? updateNode(
                          node,
                          transformBindingExpression(node, node.expression),
                          updateExportAssignmentExpression
                      )
                    : minify && isTaggedTemplateExpression(node)
                    ? transformTaggedTemplateExpression(node)
                    : undefined;

            const visitNode: ts.Visitor = (node) => transformNode(node) || ts.visitEachChild(node, visitNode, context);

            return ts.visitNode(sourceFile, visitNode) as ts.SourceFile;
        };
    };

    return transformer;
}

export default createTransformer;
