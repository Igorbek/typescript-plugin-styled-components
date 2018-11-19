import createTransformer from '../';
import { expectBaselineTransforms } from './expectTransform';

const transformer = createTransformer({
    ssr: true
});

expectBaselineTransforms(transformer, __dirname + '/baselines');
expectBaselineTransforms(transformer, __dirname + '/ssr-baselines');
