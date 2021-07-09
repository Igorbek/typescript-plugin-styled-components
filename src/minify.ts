import * as ts from 'typescript';
import { isNoSubstitutionTemplateLiteral, isTemplateExpression } from './ts-is-kind';

type State = ';' | ';$' | 'x' | ' ' | '\n' | '"' | '(' | '\'' | '/' | '//' | ';/' | ';//' | '/$' | '//$' | '/*' | '/**' | ';/*' | ';/**' | '/*$' | '/*$*';
type StateDataDef = {
    ['(']: { count: number }
}
type StateData<K extends State> = K extends keyof StateDataDef ? StateDataDef[K] : void
type StateResult = { [K in State]: K extends keyof StateDataDef ? [K, StateDataDef[K]] : K }[State]
type ReducerResult = { emit?: string; skipEmit?: boolean; state?: StateResult; } | void;
type StateMachine = {
    [K in State]: {
        next?(ch: string, data: StateData<K>): ReducerResult;
        flush?(last: boolean): ReducerResult;
    }
};

function isSymbol(ch: string) {
    return ch == ';' || ch == ':' || ch == '{' || ch == '}' || ch == ',';
}

function isSpace(ch: string) {
    return ch == ' ' || ch == '\n' || ch == '\r' || ch == '\t';
}

const stateMachine: StateMachine = {
    ';': {
        next(ch) {
            if (ch == '(') return { state: ['(', {count: 1}]}
            if (ch == '\'' || ch == '"') return { state: ch }
            if (isSpace(ch)) return { skipEmit: true }
            if (ch == '/') return { state: ';/', skipEmit: true }
            if (isSymbol(ch)) return;
            return { state: 'x' }
        },
        flush() {
            return { state: ';$' }
        }
    },
    ';$': { // after placeholder
        next(ch) {
            if (ch == '(') return { state: ['(', {count: 1}]}
            if (ch == '\'' || ch == '"') return { state: ch }
            if (isSpace(ch)) return { skipEmit: true, state: ' ' } // we may need a space
            if (ch == '/') return { state: '/', skipEmit: true }
            if (isSymbol(ch)) return { state: ';' };
            return { state: 'x' }
        }
    },
    'x': {
        next(ch) {
            if (ch == '(') return { state: ['(', {count: 1}]}
            if (ch == '\'' || ch == '"') return { state: ch }
            if (isSpace(ch)) return { state: ' ', skipEmit: true }
            if (ch == '/') return { state: '/', skipEmit: true }
            if (isSymbol(ch)) return { state: ';' };
        }
    },
    ' ': { // may need space
        next(ch) {
            if (ch == '(') return { state: ['(', {count: 1}], emit: ' ' + ch}
            if (ch == '\'' || ch == '"') return { state: ch, emit: ' ' + ch }
            if (isSpace(ch)) return { state: ' ', skipEmit: true }
            if (ch == '/') return { state: '/', skipEmit: true }
            if (isSymbol(ch)) return { state: ';' };
            return { state: 'x', emit: ' ' + ch };
        },
        flush(last) {
            if (!last) return { emit: ' ', state: ';$' };
        }
    },
    '\n': { // may need new line
        next(ch) {
            if (ch == '(') return { state: ['(', {count: 1}], emit: '\n' + ch}
            if (ch == '\'' || ch == '"') return { state: ch, emit: '\n' + ch }
            if (isSpace(ch)) return { state: '\n', skipEmit: true }
            if (ch == '/') return { state: '/', emit: '\n' }
            if (isSymbol(ch)) return { state: ';', emit: '\n' + ch };
            return { state: 'x', emit: '\n' + ch };
        }
    },
    "'": {
        next(ch) {
            if (ch == '\'') return { state: ';' };
        }
    },
    '"': {
        next(ch) {
            if (ch == '"') return { state: ';' };
        }
    },
    '(': {
        next(ch, { count }) {
            if (ch == '(') return { state: ['(', { count: count+1 }] }
            if (ch == ')')
                if (count > 1)
                return { state: ['(', { count: count-1 }] }
            else
             return { state: ';' };   // maybe return ' '? then it'd always add space after
        }
    },
    '/': {
        next(ch) {
            if (ch == '/') return { state: '//', skipEmit: true }
            if (ch == '*') return { state: '/*', skipEmit: true }
            return { state: ';', emit: '/' + ch }
        },
        flush() {
            return { state: '/$', emit: '/' }
        }
    },
    '//': {
        next(ch) {
            if (ch == '\n') return { state: ' ', skipEmit: true }
            return { skipEmit: true };
        },
        flush(last) {
            if (last) return { skipEmit: true }
            return { state: '//$', emit: '//' }
        }
    },
    ';/': {
        next(ch) {
            if (ch == '/') return { state: ';//', skipEmit: true }
            if (ch == '*') return { state: ';/*', skipEmit: true }
            return { state: ';', emit: '/' + ch }
        },
        flush() {
            return { state: '/$', emit: '/' }
        }
    },
    ';//': {
        next(ch) {
            if (ch == '\n') return { state: ';', skipEmit: true }
            return { skipEmit: true };
        },
        flush(last) {
            if (last) return { skipEmit: true }
            return { state: '//$', emit: '//' }
        }
    },
    '/$': { },
    '//$': {
        next(ch) {
            if (ch == '\n') return { state: '\n', skipEmit: true }
            return { skipEmit: true };
        }
    },
    '/*': {
        next(ch) {
            if (ch == '*') return { state: '/**', skipEmit: true }
            return { skipEmit: true };
        },
        flush(last) {
            if (last) return { skipEmit: true }
            return { state: '/*$', emit: '/*' }
        }
    },
    '/**': {
        next(ch) {
            if (ch == '/') return { state: ' ', skipEmit: true }
            return { state: '/*', skipEmit: true }
        }
    },
    ';/*': {
        next(ch) {
            if (ch == '*') return { state: ';/**', skipEmit: true }
            return { skipEmit: true };
        },
        flush(last) {
            if (last) return { skipEmit: true }
            return { state: '/*$', emit: '/*' }
        }
    },
    ';/**': {
        next(ch) {
            if (ch == '/') return { state: ';', skipEmit: true }
            return { state: ';/*', skipEmit: true }
        }
    },
    '/*$': {
        next(ch) {
            if (ch == '*') return { state: '/*$*', skipEmit: true };
            return { skipEmit: true };
        }
    },
    '/*$*': {
        next(ch) {
            if (ch == '/') return { state: ';', emit: '*/' };
            return { state: '/*$', skipEmit: true }
        }
    }
};

export function createMinifier(): (next: string, last?: boolean) => string {
    let state: State = ';';
    let stateData: StateData<State> = undefined as StateData<';'>

    return (next, last = false) => {
        let minified = '';

        function apply(result: ReducerResult, ch?: string) {
            if (!result) {
                if (ch !== undefined)
                    minified += ch;
            } else {
                if (result.state !== undefined)
                {
                    if (typeof result.state === 'string')
                        state = result.state;
                    else {
                        state = result.state[0]
                        stateData = result.state[1]
                    }
                }
                if (result.emit !== undefined)
                    minified += result.emit;
                else if (result.skipEmit !== true && ch !== undefined)
                    minified += ch;
            }
        }

        let pos = 0;
        let len = next.length;
        while (pos < len) {
            const ch = next[pos++];
            const reducer = stateMachine[state];
            const prevState = state;
            const reducerResult = reducer.next && reducer.next(ch, stateData as any);
            apply(reducerResult, ch)
            // console.log('next(', { ch, state: prevState }, '): ', reducerResult, ' -> ', { state, minified });
        }

        const reducer = stateMachine[state];
        const prevState = state;
        const reducerResult = reducer.flush && reducer.flush(last);
        apply(reducerResult);
        // console.log('flush', { state: prevState }, '): ', reducerResult, ' -> ', { state, minified });

        return minified;
    }
}

export function minifyTemplate(templateLiteral: ts.TemplateLiteral, factory: ts.NodeFactory) {
    const minifier = createMinifier();

    if (isNoSubstitutionTemplateLiteral(templateLiteral)) {
        const node = factory.createNoSubstitutionTemplateLiteral(minifier(templateLiteral.text, true));
        return node;
    } else if (isTemplateExpression(templateLiteral)) {
        const head = factory.createTemplateHead(minifier(templateLiteral.head.text));
        const templateSpans = templateLiteral.templateSpans.map(span => factory.createTemplateSpan(span.expression,
            span.literal.kind === ts.SyntaxKind.TemplateMiddle
                ? factory.createTemplateMiddle(minifier(span.literal.text))
                : factory.createTemplateTail(minifier(span.literal.text, true))));
        const node = factory.createTemplateExpression(head, templateSpans);
        return node;
    }

    return templateLiteral;
}
