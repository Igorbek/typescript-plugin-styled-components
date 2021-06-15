import createTransformer from '..';
import { expectBaselineTransforms } from './expectTransform';

const transformer = createTransformer({
    componentIdPrefix: 'test'
});

expectBaselineTransforms(transformer, __dirname + '/fixtures/base', 'baselines/componentIdPrefix');
expectBaselineTransforms(transformer, __dirname + '/fixtures/componentIdPrefix', 'baselines/componentIdPrefix');
