import type { Ace } from 'ace-builds';

export function* iterateEditor({ session }: { session: Ace.EditSession }) {
    const lines = session.getLength();
    for (let i = 0; i < lines; i++) {
        yield session.getTokens(i);
    }
}

export enum TokenType {
    numeric = 'constant.numeric.mathfinder',
    operator = 'keyword.operator.mathfinder',
    func = 'entity.name.function.mathfinder',
    variable = 'support.constant.mathfinder',
    comment = 'comment.line.mathfinder',
    invalid = 'invalid.illegal.mathfinder',
    space = 'text.mathfinder',
    tag = 'meta.tag.mathfinder',
}

/**
 * see https://github.com/ajaxorg/ace/blob/master/lib/ace/tokenizer.js#L228
 */
export function typedRules<TDumbRules extends { start: unknown }>(rules: {
    [_ in keyof TDumbRules]: {
        /**
         * @warning if `RegExp`, no flags allowed (ace has `.toString().slice(1, -1)`)
         * @warning if `string`, should be RegExp escaped (use `lodash.escapeRegExp`)
         */
        regex: RegExp | string;
        token?: TokenType | TokenType[];
        next?: keyof TDumbRules;
    }[];
}) {
    return rules;
}
