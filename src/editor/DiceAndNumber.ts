import * as ace from 'ace-builds';
import { BaseMode } from './BaseMode';
import { TokenType, typedRules } from './util';

const TextHighlightRules = ace.require('ace/mode/text_highlight_rules').TextHighlightRules;

export class DiceAndNumberMode extends BaseMode {
    HighlightRules = class extends TextHighlightRules {
        $rules = typedRules({
            start: [
                { regex: /(?=[d\d])/, next: 'term' },
                { regex: /(?:)/, next: 'operator' },
            ],
            operator: [
                { regex: /[+-]/, token: TokenType.Operator, next: 'term' },
                { regex: /(?=\S)/, token: TokenType.Comment, next: 'comment' },
                { regex: /\n/, next: 'start' },
            ],
            term: [
                { regex: /(\d*)(d\d+)/, token: [TokenType.Numeric, TokenType.Func], next: 'operator' },
                { regex: /\d+/, token: TokenType.Numeric, next: 'operator' },
                { regex: /\n/, next: 'start' },
            ],
            comment: [{ regex: /.*/, token: TokenType.Comment, next: 'start' }],
        });
    };

    static instance = new DiceAndNumberMode();
}
