export interface Options {
    /**
     * This method is used to determine component display name from filename and its binding name.
     * 
     * Default strategy is to use bindingName if it's defined and use inference algorithm from filename otherwise.
     */
    getDisplayName(filename: string, bindingName: string | undefined): string | undefined;
        
    styledIdentifiers: string[];

    ssr: boolean;
    displayName: boolean;
    rootCheck: string;
}
