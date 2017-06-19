# `typescript-plugin-styled-components`

This is a TypeScript transformer that improves development experience of [`styled-components`](styled-components.com).

The main purpose is to provide compile-time information of creates styled components, such as names of these components, for the run-time, allowing to operate with proper names of such the components.

The plugin was mostly inspired by great Babel's plugin [`babel-plugin-styled-components`](https://github.com/styled-components/babel-plugin-styled-components) and partially provides similar functionality for TypeScript users.

# Installation

The following command adds the packages to the project as a development-time dependency:

<pre><code><strong>yarn</strong> add <em>typescript-plugin-styled-components</em> --dev</code></pre>


# Integration with `Webpack` and `awesome-typescript-loader`

This section describes how to integrate the plugin into the build/bundling process driven by [**Webpack**](https://webpack.js.org/) and its TypeScript loader [**awesome-typescript-loader**](https://github.com/s-panferov/awesome-typescript-loader).

In the `webpack.config.js` file in the section where **awesome-typescript-loader** is configured as a loader:

```js
// 1. import default from the plugin module
var createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;

// 2. create a transformer;
// the factory additionally accepts an options object which described below
var styledComponentsTransformer = createStyledComponentsTransformer();

// 3. add getCustomTransformer method to the loader config
var config = {
    ...
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader',
                options: {
                    ... // other loader's options
                    getCustomTransformers: () => ({ before: [transformer] })
                }
            }
        ]
    }
    ...
};
```

# API

## `createTransformer`

```ts
function createTransformer(options?: Partial<Options>): TransformerFactory<SourceFile>;
```

A factory that creates an instance of a TypeScript transformer (which is a factory itself).

It allows to optionally pass options that allow to tweak transformer's behavior. See `Options` for details.

## `Options`

```ts
interface Options {
    getDisplayName(filename: string, bindingName: string | undefined): string | undefined;
}
```

### `getDisplayName`

This method is used to determine component display name from filename and its binding name.

`filename` is the file name, relative to the project base directory, of the file where the styled component defined.

`bindingName` is the name that is used in the source code to bind the component. It can be `null` if the component was not bound or assigned.

Default strategy is to use `bindingName` if it's defined and use inference algorithm from `filename` otherwise.

Sample:
```js
function getStyledComponentDisplay(filename, bindingName) {
    return bindingName || makePascalCase(filename);
}
```

> **Note** Technically, `typescript-plugin-styled-components` is not a TypeScript plugin, since it is only exposed as a TypeScript transformer.
