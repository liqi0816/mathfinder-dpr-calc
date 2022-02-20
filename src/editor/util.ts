import type { Ace } from 'ace-builds';

export function* iterateEditor({ session }: { session: Ace.EditSession }) {
    const lines = session.getLength();
    for (let i = 0; i < lines; i++) {
        yield session.getTokens(i);
    }
}

export enum TokenType {
    Numeric = 'constant.numeric.mathfinder',
    Operator = 'keyword.operator.mathfinder',
    Func = 'entity.name.function.mathfinder',
    Variable = 'support.constant.mathfinder',
    Comment = 'comment.line.mathfinder',
    Invalid = 'invalid.illegal.mathfinder',
    Space = 'text.mathfinder',
    Tag = 'meta.tag.mathfinder',
}

/**
 * see https://github.com/ajaxorg/ace/blob/master/lib/ace/tokenizer.js#L228
 */
export function typedRules<DumbRules extends { start: unknown }>(rules: {
    [_ in keyof DumbRules]: {
        /**
         * @warning if `RegExp`, no flags allowed (ace has `.toString().slice(1, -1)`)
         * @warning if `string`, should be RegExp escaped (use `lodash.escapeRegExp`)
         */
        regex: RegExp | string;
        token?: TokenType | TokenType[];
        next?: keyof DumbRules;
    }[];
}) {
    return rules;
}
