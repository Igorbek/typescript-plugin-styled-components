# `typescript-plugin-styled-components`

This is a TypeScript transformer that improves development experience of [`styled-components`](https://www.styled-components.com/).

The main purpose is to provide compile-time information of creates styled components, such as names of these components, for the run-time, allowing to operate with proper names of such the components.

The plugin was mostly inspired by great Babel's plugin [`babel-plugin-styled-components`](https://github.com/styled-components/babel-plugin-styled-components) and partially provides similar functionality for TypeScript users.

# Installation

The following command adds the packages to the project as a development-time dependency:

<pre><code><strong>yarn</strong> add <em>typescript-plugin-styled-components</em> --dev</code></pre>


# Integration with `Webpack`

This section describes how to integrate the plugin into the build/bundling process driven by [**Webpack**](https://webpack.js.org/) and its TypeScript loaders.

There are two popular TypeScript loaders that support specifying custom transformers:

- [**awesome-typescript-loader**](https://github.com/s-panferov/awesome-typescript-loader), supports custom transformers since v3.1.3
- [**ts-loader**](https://github.com/TypeStrong/ts-loader), supports custom transformers since v2.2.0

Both loaders use the same setting `getCustomTransformers` which is an optional function that returns `{ before?: Transformer[], after?: Transformer[] }`.
In order to inject the transformer into compilation, add it to `before` transformers array, like: `{ before: [styledComponentsTransformer] }`.

## `awesome-typescript-loader`

In the `webpack.config.js` file in the section where **awesome-typescript-loader** is configured as a loader:

```js
// 1. import default from the plugin module
const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;

// 2. create a transformer;
// the factory additionally accepts an options object which described below
const styledComponentsTransformer = createStyledComponentsTransformer();

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
                    getCustomTransformers: () => ({ before: [styledComponentsTransformer] })
                }
            }
        ]
    }
    ...
};
```

Please note, that in the development mode, `awesome-typescript-loader` uses multiple separate processes to speed up compilation. In that mode the above configuration cannot work because functions, which `getCustomTransformers` is, are not transferrable between processes.
To solve this please refer to [Forked process configuration](#forked-process-configuration) section.

## `ts-loader`

In the `webpack.config.js` file in the section where **ts-loader** is configured as a loader:

```js
// 1. import default from the plugin module
const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;

// 2. create a transformer;
// the factory additionally accepts an options object which described below
const styledComponentsTransformer = createStyledComponentsTransformer();

// 3. add getCustomTransformer method to the loader config
var config = {
    ...
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    ... // other loader's options
                    getCustomTransformers: () => ({ before: [styledComponentsTransformer] })
                }
            }
        ]
    }
    ...
};
```

Please note, when `awesome-typescript-loader` is used with `HappyPack` or `thread-loader`, they use multiple separate processes to speed up compilation. In that mode the above configuration cannot work because functions, which `getCustomTransformers` is, are not transferrable between processes.
To solve this please refer to [Forked process configuration](#forked-process-configuration) section.

## Forked process configuration

To configure the transformer for development mode in `awesome-typescript-loader` or `ts-loader` with `HappyPack` or `thread-loader`, you need to make `getCustomTransformers` a resolvoble module name instead of the function. Since the configuration is very similar, here's an example:

### 1. Move `styledComponentsTransformer` into a separate file

Let's assume it is in the same folder as your `webpack.config` and has name `webpack.ts-transformers.js`:
```js
// 1. import default from the plugin module
const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;

// 2. create a transformer;
// the factory additionally accepts an options object which described below
const styledComponentsTransformer = createStyledComponentsTransformer();

// 3. create getCustomTransformer function
const getCustomTransformers = () => ({ before: [styledComponentsTransformer] });

// 4. export getCustomTransformers
module.exports = getCustomTransformers;
```

### 2. Change the loader's options to point to that file instead of explicit function

```diff
-const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;
-const styledComponentsTransformer = createStyledComponentsTransformer();

options: {
    ... // other loader's options
-    getCustomTransformers: () => ({ before: [styledComponentsTransformer] })
+    getCustomTransformers: path.join(__dirname, './webpack.ts-transformers.js')
}
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

# Notes

Technically, `typescript-plugin-styled-components` is not a TypeScript plugin, since it is only exposed as a TypeScript transformer.
