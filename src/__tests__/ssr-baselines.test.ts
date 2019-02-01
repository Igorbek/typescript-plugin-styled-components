import createTransformer from '../';
import { expectBaselineTransforms } from './expectTransform';

const transformer = createTransformer({
    ssr: true
});

expectBaselineTransforms(transformer, __dirname + '/fixtures/base', 'baselines/ssr');
expectBaselineTransforms(transformer, __dirname + '/fixtures/ssr', 'baselines/ssr');
