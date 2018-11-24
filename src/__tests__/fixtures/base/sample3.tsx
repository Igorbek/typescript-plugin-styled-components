import * as React from 'react';
import styled from '../themed-styled';
import { SmallButton } from './sample1';

interface LabelProps {
    size: number;
}

const CustomLabel = styled.label`
    font-size: ${(props: LabelProps) => props.size + 'px'}
`;

const LabeledLink = () => <SmallButton />;

export default CustomLabel;
