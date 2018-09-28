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
import { hash } from './hash';
import * as fs from 'fs';
import * as path from 'path';

/** Detects that a node represents a styled function
 * Recognizes the following patterns:
 *
 * styled.tag
 * Component.extend
 * styled(Component)
 * styledFunction.attrs(attributes)
*/
function isStyledFunction(node: ts.Node, styledIdentifiers: string[]): boolean {
    if (isPropertyAccessExpression(node)) {
        if (isStyledObject(node.expression, styledIdentifiers)) {
            return true;
        }

        if (node.name.text === 'extend'
            && isValidComponent(node.expression)) {

            return true;
        }

        return false;
    }

    if (isCallExpression(node) && node.arguments.length === 1) {

        if (isStyledObject(node.expression, styledIdentifiers)) {
            return true;
        }

        if (isStyledAttrs(node.expression, styledIdentifiers)) {
            return true;
        }
    }

    return false;
}

function isStyledObject(node: ts.Node, styledIdentifiers: string[]) {
    return node && isIdentifier(node) && (node.text === 'styled' || styledIdentifiers.indexOf(node.text) !== -1);
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

function isStyledAttrs(node: ts.Node, styledIdentifiers: string[]) {
    return node && isPropertyAccessExpression(node)
        && node.name.text === 'attrs'
        && isStyledFunction((node as ts.PropertyAccessExpression).expression, styledIdentifiers);
}

function defaultGetDisplayName(filename: string, bindingName: string | undefined): string | undefined {
    return bindingName;
}

export function createTransformer(options?: Partial<Options>): ts.TransformerFactory<ts.SourceFile>
export function createTransformer({ getDisplayName = defaultGetDisplayName, styledIdentifiers = [], useSSR } : Partial<Options> = {}) {

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

    const separatorRegExp = new RegExp(`\\${path.sep}`, 'g');
    const findModuleRoot = (filename: string): string | null => {
        if (!filename) {
            return null
        }
        let dir = path.dirname(filename)
        if (fs.existsSync(path.join(dir, 'package.json'))) {
            return dir
        } else if (dir !== filename) {
            return findModuleRoot(dir)
        } else {
            return null
        }
    }

    function getIdFromNode(node: ts.Node): string | undefined {
        if ((isVariableDeclaration(node) && isIdentifier(node.name)) || isExportAssignment(node)) {
            const fileName = node.getSourceFile().fileName;
            const moduleRoot = findModuleRoot(fileName)
            const filePath = moduleRoot ? path.relative(moduleRoot, fileName).replace(separatorRegExp, '/') : '';
            return 'sc-' + hash(filePath);
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
                && isStyledFunction(node, styledIdentifiers as string[])) {

                const displayName = getDisplayNameFromNode(node.parent.parent);
                let componentId;
                if(useSSR){
                    componentId = getIdFromNode(node.parent.parent);
                }

                if (displayName) {
                    const styledConfig = [
                        ts.createPropertyAssignment('displayName', ts.createLiteral(displayName)),
                    ];
                    if(componentId){
                        styledConfig.push(ts.createPropertyAssignment('componentId', ts.createLiteral(componentId)));                        
                    }
                    return ts.createCall(
                        ts.createPropertyAccess(node as ts.Expression, 'withConfig'),
                        undefined,
                        [ts.createObjectLiteral(styledConfig),]);
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
