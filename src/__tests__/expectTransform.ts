import 'jest';
import { addSerializer } from 'jest-specific-snapshot';
import * as ts from 'typescript';
import * as fs from 'fs';

const printer = ts.createPrinter();

interface TransformBaseline {
    type: 'transform-baseline';
    filename: string;
    content: string;
    source: string;
    transformed: string;
    transpiled: string;
}

const serializer = {
    test: (obj: any): obj is TransformBaseline => obj && obj.type === 'transform-baseline',
    print: (obj: TransformBaseline, print: (object: any) => string, indent: (str: string) => string) => `
File: ${obj.filename}
Source code:

${indent(obj.content)}

TypeScript before transform:

${indent(obj.source)}

TypeScript after transform:

${indent(obj.transformed)}

TypeScript after transpile module:

${indent(obj.transpiled)}

`
};

addSerializer(serializer);

export function expectTransform(transformer: ts.TransformerFactory<ts.SourceFile>, filename: string, path: string, outpath: string) {
    const content = fs.readFileSync(path + '/' + filename).toString();
    const sourceFile = ts.createSourceFile(filename, content, ts.ScriptTarget.Latest, /* setParentNodes */ true);
    const source = printer.printFile(sourceFile);
    const transformedFile = ts.transform(sourceFile, [transformer]).transformed[0];
    const transformed = printer.printFile(transformedFile);

    const transpileOutput = ts.transpileModule(content, {
        compilerOptions: {
            target: ts.ScriptTarget.Latest
        },
        transformers: {
            before: [transformer]
        }
    })
    const transpiled = transpileOutput.outputText

    const snapshot: TransformBaseline = {
        type: 'transform-baseline',
        filename,
        content,
        source,
        transformed,
        transpiled
    };

    expect(snapshot).toMatchSpecificSnapshot(outpath + '/' + filename + '.baseline');
}

export function expectBaselineTransforms(transformer: ts.TransformerFactory<ts.SourceFile>, path: string, outpath: string) {
    const files = fs.readdirSync(path)
        .filter(f => f.toLowerCase().endsWith('.tsx') || f.toLowerCase().endsWith('.ts'));

    files.forEach(file => it(file, () => expectTransform(transformer, file, path, outpath)));
}
