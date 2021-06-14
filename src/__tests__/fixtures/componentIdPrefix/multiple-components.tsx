import styled from 'styled-components';

export function createButtons() {
    const A = styled.button` color: red; `;
    const B = styled(A)` color: blue; `;

    return { A, B };
}

export function createDivs() {
    const A = styled.div` color: green; `;
    const B = styled(A)` color: yellow; `;

    return { A, B };
}
