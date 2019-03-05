import * as ts from 'typescript';
import { isNoSubstitutionTemplateLiteral, isTemplateExpression } from './ts-is-kind';

type State = ';' | 'x' | ' ' | '"' | '\'' | '/' | '//' | '/$' | '//$' | '/*' | '/**' | '/*$' | '/*$*';
type ReducerResult = { emit?: string; skipEmit?: boolean; state?: State } | void;
type StateMachine = {
    [K in State]: {
        next?(ch: string): ReducerResult;
        flush?(): ReducerResult;
    }
};

function isSymbol(ch: string) {
    return ch == ';' || ch == ':' || ch == '{' || ch == '}';
}

const stateMachine: StateMachine = {
    ';': {
        next(ch) {
            if (ch == '\'' || ch == '"') return { state: ch }
            if (ch == ' ' || ch == '\n' || ch == '\r') return { skipEmit: true }
            if (ch == '/') return { state: '/', skipEmit: true }
            if (isSymbol(ch)) return;
            return { state: 'x' }
        }
    },
    'x': {
        next(ch) {
            if (ch == '\'' || ch == '"') return { state: ch }
            if (ch == ' ' || ch == '\n' || ch == '\r') return { state: ' ', skipEmit: true }
            if (ch == '/') return { state: '/', skipEmit: true }
            if (isSymbol(ch)) return { state: ';' };
        }
    },
    ' ': { // may need space
        next(ch) {
            if (ch == '\'' || ch == '"') return { state: ch }
            if (ch == ' ' || ch == '\n' || ch == '\r') return { state: ' ', skipEmit: true }
            if (ch == '/') return { state: '/', skipEmit: true }
            if (isSymbol(ch)) return { state: ';' };
            return { state: 'x', emit: ' ' + ch };
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
            if (ch == '\n') return { state: ';', skipEmit: true }
            return { skipEmit: true };
        },
        flush() {
            return { state: '//$', emit: '//' }
        }
    },
    '/$': { },
    '//$': {
        next(ch) {
            if (ch == '\n') return { state: ';', skipEmit: true }
            return { skipEmit: true };
        }
    },
    '/*': {
        next(ch) {
            if (ch == '*') return { state: '/**', skipEmit: true }
            return { skipEmit: true };
        },
        flush() {
            return { state: '/*$', emit: '/*' }
        }
    },
    '/**': {
        next(ch) {
            if (ch == '/') return { state: ';', skipEmit: true }
            return { state: '/*', skipEmit: true }
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

function createMinifier(): (next: string, middle?: boolean) => string {
    let state: State = ';';

    return (next, middle = false) => {
        let minified = '';

        function apply(result: ReducerResult, ch?: string) {
            if (!result) {
                if (ch !== undefined)
                    minified += ch;
            } else {
                if (result.state !== undefined)
                    state = result.state;
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
            apply(reducer.next && reducer.next(ch), ch)
        }

        const reducer = stateMachine[state];
        apply(reducer.flush && reducer.flush());

        return minified;
    }
}

function *minifierFn() {
    let nextResult = '';
    while (true) {
        const next = yield nextResult;
        nextResult = next;
    }
}

export function minifyTemplate(templateLiteral: ts.TemplateLiteral) {
    const minifier = createMinifier();

    if (isNoSubstitutionTemplateLiteral(templateLiteral)) {
        // const sourceMapRange = ts.getSourceMapRange(templateLiteral);
        const node = ts.createNoSubstitutionTemplateLiteral(minifier(templateLiteral.text));
        // ts.setSourceMapRange(node, sourceMapRange);
        return node;
    } else if (isTemplateExpression(templateLiteral)) {
        const head = ts.createTemplateHead(minifier(templateLiteral.head.text));
        const templateSpans = templateLiteral.templateSpans.map(span => ts.createTemplateSpan(span.expression,
            span.literal.kind === ts.SyntaxKind.TemplateMiddle
                ? ts.createTemplateMiddle(minifier(span.literal.text, true))
                : ts.createTemplateTail(minifier(span.literal.text))));
        const node = ts.createTemplateExpression(head, templateSpans);
        return node;
    }

    return templateLiteral;
}