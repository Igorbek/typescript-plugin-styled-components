import * as React from 'react';
import styled from 'styled-components';

const Component1Style = styled.div`
    height: 40px;
    background: green;
    width: 200;
    display: flex;
`;

export const Component1 : React.SFC = () =>  (
    <Component1Style>
        Test
    </Component1Style>
)