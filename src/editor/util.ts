import type { Ace } from 'ace-builds';

export function* iterateEditor({ session }: { session: Ace.EditSession }) {
    const lines = session.getLength();
    for (let i = 0; i < lines; i++) {
        yield session.getTokens(i);
    }
}

export enum TokenType {
    space = 'text.mathfinderm',
    comment = 'comment.line.mathfinder',
    numeric = 'constant.numeric.mathfinder',
    operator = 'keyword.operator.mathfinder',
    invalid = 'invalid.illegal.mathfinder',
    func = 'entity.name.function.mathfinder',
    variable = 'support.constant.mathfinder',
}

/**
 * see https://github.com/ajaxorg/ace/blob/master/lib/ace/tokenizer.js#L228
 */
export function typedRules<TDumbRules extends { start: unknown }>(rules: {
    [_ in keyof TDumbRules]: {
        regex: RegExp | string;
        token?: TokenType | TokenType[];
        next?: keyof TDumbRules;
    }[];
}) {
    return rules;
}
