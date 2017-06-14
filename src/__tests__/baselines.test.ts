import 'jest';
import * as ts from 'typescript';
import * as fs from 'fs';
import * as glob from 'glob';
import transformer from '../transformer';

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

function expectTransform(filename: string) {
    const content = fs.readFileSync('./src/__tests__/baselines/' + filename).toString();
    const sourceFile = ts.createSourceFile(filename, content, ts.ScriptTarget.Latest);
    const source = printer.printFile(sourceFile);
    const transformedFile = ts.transform(sourceFile, [transformer]);
    const transformed = printer.printFile(transformedFile.transformed[0]);

    const snapshot: TransformBaseline = {
        type: 'transform-baseline',
        filename,
        content,
        source,
        transformed
    };

    expect(snapshot).toMatchSnapshot();
}

const files = ['sample1.ts'];

files.forEach(file => it(file, () => expectTransform(file)));
