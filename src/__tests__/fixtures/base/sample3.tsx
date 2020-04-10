import * as React from 'react';
import styled from '../../themed-styled';
import { SmallButton } from './sample1';

interface LabelProps {
    size: number;
}

const CustomLabel = styled.label<LabelProps>`
    font-size: ${props => props.size}px;
    color: ${props => props.theme.color};
`;

const LabeledLink = () => <SmallButton />;

export default CustomLabel;
