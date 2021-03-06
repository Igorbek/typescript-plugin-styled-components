declare const styled: any;

declare const placeholder1: any;
declare const placeholder2: any;

// splits a line by potential comment starts and joins until one is an actual comment
// `abc def`
styled.div`abc def//ghi//jkl`

// ignores comment markers that are inside strings
// `abc def"//"ghi\'//\'jkl`
styled.div`abc def"//"ghi\'//\'jkl//the end`
// `abc def"//"`
styled.div`abc def"//"`

// ignores comment markers that are inside parantheses
// `bla (//) bla`
styled.div`bla (//) bla//the end`

// ignores even unescaped URLs
// `https://test.com`
styled.div`https://test.com// comment//`

// removes multi-line comments
// `this is a test`
styled.div`this is a/* ignore me please */test`

// joins all lines of code
// `this is a test`
styled.div`this\nis\na/* ignore me \n please */\ntest`

// removes line comments filling an entire line
// `line one{line:two;}`
styled.div`line one {
  // remove this comment
  line: two;
}`

// removes line comments at the end of lines of code
// `valid line with out comments`
styled.div`valid line with // a comment
out comments`

// preserves multi-line comments starting with /*!
// `this is a /*! dont ignore me please */ test`
styled.div`this is a /*! dont ignore me please */ test/* but you can ignore me */`

// returns the indices of removed placeholders (expressions)
// `this is some input with ${placeholder1} and //${placeholder2}`
styled.div`this is some\ninput with ${placeholder1} and // ignored ${placeholder2}`

// works with raw escape codes
// `this\\nis\\na \\ntest`
styled.div`this\\nis\\na/* ignore me \\n please */\\ntest`
// `this\nis\na \ntest`
styled.div`this\nis\na/* ignore me \n please */\ntest`
// `this is a test`
styled.div`this
is
a/* ignore me \n please */
test`

// removes spaces around symbols
// `;:{},;`
styled.div`;  :  {  }  ,  ;  `

// ignores symbols inside strings
// `;" : "\' : \';`
styled.div`;   " : " \' : \' ;`
