
const createStyledComponentsTransformer = require('../../dist').default;

const styledComponentsTransformer = createStyledComponentsTransformer({
   // getDisplayName: (name) => name
   ssr: true,
   displayName: false,
});

module.exports = () => ({ before: [styledComponentsTransformer] });

