/* Role: styled-component re-export with builder theme support */

// tslint:disable-next-line:import-blacklist
import * as StyledComponentModule from 'styled-components';
// tslint:disable-next-line:no-duplicate-imports
// tslint:disable-next-line:import-blacklist
import { ThemedStyledComponentsModule, ThemedStyledProps, SimpleInterpolation } from 'styled-components';

interface Theme {
    color: string;
}

const {
    default: styled,
    css,
    injectGlobal,
    keyframes: keyframesOriginal,
    ThemeProvider,
    withTheme
} = StyledComponentModule  as ThemedStyledComponentsModule<any> as ThemedStyledComponentsModule<Theme>;

function keyframes(strings: TemplateStringsArray, ...interpolations: SimpleInterpolation[]): () => string {
    let value: string | undefined;
    return () => value || (value = keyframesOriginal(strings, ...interpolations));
}

export type StyledProps<P> = ThemedStyledProps<P, Theme>;
export default styled;
export { css, injectGlobal, keyframes, withTheme, ThemeProvider };
