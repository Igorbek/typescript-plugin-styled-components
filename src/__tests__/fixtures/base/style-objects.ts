declare const styled: any;

const Button = styled.button({
  color: 'red'
});

declare const nonStyled: any;

const NonButton = nonStyled.button({
  color: 'red'
});

const OtherButton = styled(Button)({
  color: 'blue'
});

const SuperButton = Button.extend({
  color: 'super'
});

export default styled.link({
  color: 'black'
});

export const SmallButton = Button.extend({
  fontSize: '.7em'
});

const MiniButton = styled(SmallButton).attrs({ size: 'mini' })({
  fontSize: '.1em'
});
