import type { Ace } from 'ace-builds';

export function* iterateEditor({ session }: { session: Ace.EditSession }) {
    const lines = session.getLength();
    for (let i = 0; i < lines; i++) {
        yield session.getTokens(i);
    }
}

export type TokenType =
    | 'text'
    | 'comment.line'
    | 'constant.numeric'
    | 'keyword.operator'
    | 'invalid.illegal'
    | 'entity.name.function';

/**
 * see https://github.com/ajaxorg/ace/blob/master/lib/ace/tokenizer.js#L228
 */
export function typedRules<TDumbRules extends { start: unknown }>(rules: {
    [_ in keyof TDumbRules]: {
        regex: RegExp;
        token?: TokenType | TokenType[];
        next?: keyof TDumbRules;
    }[];
}) {
    return rules;
}
