import * as React from 'react';
import styled from 'styled-components';

const Component1Style = styled.div`
    background: #fff;
    text-align: center;
`;

const TextStyle = styled.h3`
    color:  #000;
    font-weight: bold;
`;
export const Component1 : React.SFC = () =>  (
    <Component1Style>
        <TextStyle>SubComponent</TextStyle>
    </Component1Style>
)