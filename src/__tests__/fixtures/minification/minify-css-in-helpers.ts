declare const keyframes: any;
declare const css: any;
declare const createGlobalStyle: any;

declare const theColor: any;

const key = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const color = css`
  color: ${theColor};
`;

const MyRedBody = createGlobalStyle`
  body {
    background-color: red; // comments
    ${color} // comments
    // it will be ignored, but still emitted ${color}
  }
`;

export {};
