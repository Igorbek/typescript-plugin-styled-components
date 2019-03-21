import createTransformer from '../';
import { expectBaselineTransforms } from './expectTransform';

const transformer = createTransformer({ displayName: false, ssr: false, minify: true });

expectBaselineTransforms(transformer, __dirname + '/fixtures/minification', 'baselines/minification-only');
