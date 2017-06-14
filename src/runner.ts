import * as ts from 'typescript';

import sampleTransformer from './transformer';

function main(files: string[]) {
  // Normally these would be parsed from tsconfig.json
  const options: ts.CompilerOptions = {
    skipLibCheck: true,
    outDir: 'built',
    module: ts.ModuleKind.CommonJS,
    noEmitOnError: false
  };

  const beforeTransforms = [sampleTransformer];
  const afterTransforms: ts.TransformerFactory<ts.SourceFile>[] = [];

  // Do the normal compilation flow
  const compilerHost = ts.createCompilerHost(options);
  const program = ts.createProgram(files, options, compilerHost);

  const emitResult = program.emit(
      undefined, undefined, undefined, undefined,
      {before: beforeTransforms, after: afterTransforms});
}

main(['src/__tests__/baselines/sample1.ts']);
