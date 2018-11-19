import 'jest';
import * as ts from 'typescript';
import * as fs from 'fs';

const printer = ts.createPrinter();

interface TransformBaseline {
    type: 'transform-baseline';
    filename: string;
    content: string;
    source: string;
    transformed: string;
}

(expect as any).addSnapshotSerializer({
    test: obj => obj && obj.type === 'transform-baseline',
    print: (obj: TransformBaseline, print: (object: any) => string, indent: (str: string) => string) => `
File: ${obj.filename}
Source code:

${indent(obj.content)}

TypeScript before transform:

${indent(obj.source)}

TypeScript after transform:

${indent(obj.transformed)}

`
});

export function expectTransform(transformer: ts.TransformerFactory<ts.SourceFile>, filename: string, path: string) {
    const content = fs.readFileSync(path + '/' + filename).toString();
    const sourceFile = ts.createSourceFile(filename, content, ts.ScriptTarget.Latest);
    const source = printer.printFile(sourceFile);
    const transformedFile = ts.transform(sourceFile, [transformer]).transformed[0];
    const transformed = printer.printFile(transformedFile);

    const snapshot: TransformBaseline = {
        type: 'transform-baseline',
        filename,
        content,
        source,
        transformed
    };

    expect(snapshot).toMatchSnapshot(filename);
}

export function expectBaselineTransforms(transformer: ts.TransformerFactory<ts.SourceFile>, path: string) {
    const files = fs.readdirSync(path)
        .filter(f => f.toLowerCase().endsWith('.tsx') || f.toLowerCase().endsWith('.ts'));
    
    files.forEach(file => it(file, () => expectTransform(transformer, file, path)));
}
