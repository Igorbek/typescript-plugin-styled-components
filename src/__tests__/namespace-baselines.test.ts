import createTransformer from '..';
import { expectBaselineTransforms } from './expectTransform';

const transformer = createTransformer({
    namespace: 'test'
});

expectBaselineTransforms(transformer, __dirname + '/fixtures/base', 'baselines/namespace');
expectBaselineTransforms(transformer, __dirname + '/fixtures/namespace', 'baselines/namespace');
