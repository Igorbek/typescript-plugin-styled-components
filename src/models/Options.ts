export interface Options {
    /**
     * This method is used to determine component display name from filename and its binding name.
     * 
     * Default strategy is to use bindingName if it's defined and use inference algorithm from filename otherwise.
     */
    getDisplayName(filename: string, bindingName: string | undefined): string | undefined;
    
    /**
     * This array allow to identify the node name in case of style-components wrapper functions
     */
    styledIdentifiers: string[];
    
    /**
     * If set to true generates a unique componentId composed by the file path and the component name (default bindingName)
     * default value: false
     */
    ssr: boolean;

    /**
     * If set to true sets the component dispaly name
     * default value: true
     */
    displayName: boolean;

    
    /**
     * String to determine what is the project root
     * default value: package.json
     */
    rootCheck: string;
}
