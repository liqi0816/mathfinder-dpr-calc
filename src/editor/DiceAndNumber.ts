import * as ace from 'ace-builds';
import { BaseEditorMode } from './BaseMode';
import { TokenType, typedRules } from './util';

const TextHighlightRules = ace.require('ace/mode/text_highlight_rules').TextHighlightRules;

export class DiceAndNumberCommentMode extends BaseEditorMode {
    HighlightRules = class extends TextHighlightRules {
        $rules = typedRules({
            start: [
                { regex: /(?=[d\d])/, next: 'term' },
                { regex: /(?:)/, next: 'operator' },
            ],
            operator: [
                { regex: /[+-]/, token: TokenType.operator, next: 'term' },
                { regex: /(?=\S)/, token: TokenType.comment, next: 'comment' },
                { regex: /\n/, next: 'start' },
            ],
            term: [
                { regex: /(\d*)(d\d+)/, token: [TokenType.numeric, TokenType.func], next: 'operator' },
                { regex: /\d+/, token: TokenType.numeric, next: 'operator' },
                { regex: /\n/, next: 'start' },
            ],
            comment: [{ regex: /.*/, token: TokenType.comment, next: 'start' }],
        });
    };

    static instance = new DiceAndNumberCommentMode();
}
