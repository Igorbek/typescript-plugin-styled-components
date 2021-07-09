declare const styled: any;

// repro from #233
const ValueCalc = styled.div`
  height: calc(var(--line-height) - 5px);
  width: calc(100% - 5px);
`;

// another case from #233
styled.div`--padding-button: calc(var(--padding-button-vertical) - 2px) calc(var(--padding-button-horizontal) - 2px);`

// a few more cases
styled.div`
 width: calc(   1%)
 width: calc(   1%   + var(--a) - calc(2%))
 width: calc(   1%   + var(--a) - calc(2%) + calc( 1px + calc(1px + 2px) + var(--a)))
`
