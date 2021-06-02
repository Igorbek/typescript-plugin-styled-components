export interface Options {
    /**
     * This method is used to determine component display name from filename and its binding name.
     *
     * Default strategy is to use `bindingName` if it's defined and use inference algorithm from `filename` otherwise.
     */
    getDisplayName(filename: string, bindingName: string | undefined): string | undefined;

    /**
     * This option allows to customize identifiers used by `styled-components` API functions.
     */
    identifiers: CustomStyledIdentifiers;

    /**
     * By adding a unique identifier to every styled component, this plugin avoids checksum mismatches
     * due to different class generation on the client and on the server.
     * This option allows to disable component id generation by setting it to `false`
     *
     * @defaultValue `true`
     */
    ssr: boolean;

    /**
     * This option enhances the attached CSS class name on each component with richer output
     * to help identify your components in the DOM without React DevTools.
     * It also adds allows you to see the component's `displayName` in React DevTools.
     *
     * To disable `displayName` generation set this option to `false`
     *
     * @defaultValue `true`
     */
    displayName: boolean;

    /**
     * Allow minifying of inline styles in styled functions.
     * The minification is an experimental feature, please use with care.
     *
     * @defaultValue `false`
     * @experimental The minification feature is experimental.
     */
    minify: boolean;

    /**
     * By adding a componentIdPrefix, running multiple instances of typescript-plugin-styled-components
     * will not result in clashes caused by the class generation hash.
     *
     * @defaultValue `''`
     */
     componentIdPrefix: string;
}

export interface CustomStyledIdentifiers {
    /**
     * Identifiers of `styled` function.
     *
     * @defaultValue `['styled']`
     */
    styled?: string[];

    /**
     * Identifiers of `attrs` function.
     *
     * @defaultValue `['attrs']`
     */
    attrs?: string[];

    /**
     * Identifiers of `keyframes` function.
     *
     * @defaultValue `['keyframes']`
     */
    keyframes?: string[];

    /**
     * Identifiers of `css` function.
     *
     * @defaultValue `['css']`
     */
    css?: string[];

    /**
     * Identifiers of `createGlobalStyle` function.
     *
     * @defaultValue `['createGlobalStyle']`
     */
    createGlobalStyle?: string[];

    /**
     * Identifiers of `extend` function.
     *
     * @defaultValue `[]`
     */
     extend?: string[];
}
