
const createStyledComponentsTransformer = require('../../dist').default;

const styledComponentsTransformer = createStyledComponentsTransformer();

module.exports = () => ({ before: [styledComponentsTransformer] });

