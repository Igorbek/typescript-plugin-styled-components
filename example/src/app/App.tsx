import * as React from 'react';
import styled from 'styled-components';
import { Component1 } from './Comp';

const BodyStyle = styled.div`
  height: 60px;
  background: blue;
  width: 100%;
  display: flex;
  position: absolute;
  padding: 0 1rem;

  @media (max-width: 1140px) {
      padding-right: 0px;
  }
`;

const Header = styled.h2`
  color: yellow;
`;

class App extends React.Component<{}, {isMounted: boolean}> {
  state = {
    isMounted: false
  }
  componentDidMount(){
    this.setState({isMounted: true})
  }
  render(){
    return (
      <div>
        <BodyStyle>
          <Header>Welcome to Typescript Styled Components SSR</Header>
          {
            this.state.isMounted && 
            <div>Test Mounted</div>
          }
          <Component1 />
        </BodyStyle>
      </div>
    );
  }
} 

export default App;
