declare const keyframes: any;
declare const styled: any;

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const StyledDiv = styled.div`
  width: 100px;
  height: 100px;
  background-color: greenyellow;
  animation: ${rotate360} 2s linear infinite;
`;
