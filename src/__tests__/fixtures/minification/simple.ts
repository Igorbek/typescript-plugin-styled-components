declare const styled: any;

declare const placeholder1: any;
declare const placeholder2: any;

// splits a line by potential comment starts and joins until one is an actual comment
styled`abc def//ghi//jkl`

// ignores comment markers that are inside strings
styled`abc def"//"ghi\'//\'jkl//the end`
styled`abc def"//"`

// ignores comment markers that are inside parantheses
styled`bla (//) bla//the end`

// ignores even unescaped URLs
styled`https://test.com// comment//`

// removes multi-line comments
styled`this is a/* ignore me please */test`

// joins all lines of code
styled`this\nis\na/* ignore me \n please */\ntest`

// removes line comments filling an entire line
styled`line one
// remove this comment
line two`

// removes line comments at the end of lines of code
styled`valid line with // a comment
out comments`

// preserves multi-line comments starting with /*!
styled`this is a /*! dont ignore me please */ test/* but you can ignore me */`

// returns the indices of removed placeholders (expressions)
styled`this is some\ninput with ${placeholder1} and // ignored ${placeholder2}`

// works with raw escape codes
styled`this\\nis\\na/* ignore me \\n please */\\ntest`
styled`this\nis\na/* ignore me \n please */\ntest`
styled`this
is
a/* ignore me \n please *
ntest`

// removes spaces around symbols
styled`;  :  {  }  ,  ;  `

// ignores symbols inside strings
styled`;   " : " \' : \' ;`
