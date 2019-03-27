declare const styled: any;

export const A = styled.div`
  border: ${'solid'} 10px;
`

styled.div`
  border: ${'solid'}// comment here
10px;
  border: solid// comment here
10px;
`

styled.div`
  border: ${'solid'}/* comment here
*/10px;
  border: ${'solid'}/* comment here
*/ 10px;
`
