export {}
declare const styled: any;

// spaces before and after ' " ( )
styled.div`a  b"  c  "  d` // `a b"  c  "d`
styled.div`a  b'  c  '  d` // `a b'  c  'd`
styled.div`a  b(  c  )  d` // `a b(  c  )d`
styled.div`a  b  "  c  "d` // `a b "  c  "d`
styled.div`a  b  '  c  'd` // `a b '  c  'd`
styled.div`a  b  (  c  )d` // `a b (  c  )d`
