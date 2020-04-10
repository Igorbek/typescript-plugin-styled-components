/* Role: styled-component re-export with theme support */

// tslint:disable-next-line:import-blacklist
import * as StyledComponentModule from 'styled-components';
// tslint:disable-next-line:no-duplicate-imports
// tslint:disable-next-line:import-blacklist
import { ThemedStyledComponentsModule, ThemedStyledProps } from 'styled-components';

interface Theme {
    color: string;
}

const {
    default: styled,
    css,
    createGlobalStyle,
    keyframes,
    ThemeProvider,
    withTheme
} = StyledComponentModule  as ThemedStyledComponentsModule<object> as ThemedStyledComponentsModule<Theme>;

export type StyledProps<P> = ThemedStyledProps<P, Theme>;
export default styled;
export { css, createGlobalStyle, keyframes, withTheme, ThemeProvider };
