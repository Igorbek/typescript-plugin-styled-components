import styled from 'styled-components';

const Button = styled.button`
  color: red;
`;

declare const nonStyled: any;

const NonButton = nonStyled.button`
  yo
`;

const OtherButton = styled(Button)`
  color: blue;
`;

const SuperButton = Button.extend`
  color: super;
`;

export default styled.link`
  color: black;
`;

export const SmallButton = Button.extend`
  font-size: .7em;
`;
