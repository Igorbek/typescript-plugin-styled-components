import * as React from 'react';
import styled from 'styled-components';
import { Component1 } from './Component1';

const BodyStyle = styled.div`
  background: blue;
  padding: 20px;
`;

const Header = styled.h2`
  color: yellow;
`;

class App extends React.Component<{}> {

  render(){
    return (
      <div>
        <BodyStyle>
          <Header>Welcome to Typescript Styled Components SSR</Header>
          <Component1 />
        </BodyStyle>
      </div>
    );
  }
} 

export default App;
