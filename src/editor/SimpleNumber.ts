import * as ace from 'ace-builds';
import { BaseMode } from './BaseMode';
import { TokenType, typedRules } from './util';

const TextHighlightRules = ace.require('ace/mode/text_highlight_rules').TextHighlightRules;

export class SimpleNumberMode extends BaseMode {
    HighlightRules = class extends TextHighlightRules {
        $rules = typedRules({
            start: [
                { regex: /(?=\d)/, next: 'term' },
                { regex: /(?:)/, next: 'operator' },
            ],
            operator: [
                { regex: /[+-]/, token: TokenType.operator, next: 'term' },
                { regex: /(?=\S)/, token: TokenType.comment, next: 'comment' },
                { regex: /\n/, next: 'start' },
            ],
            term: [
                { regex: /\d+/, token: TokenType.numeric, next: 'operator' },
                { regex: /\n/, token: TokenType.numeric, next: 'start' },
            ],
            comment: [{ regex: /.*/, token: TokenType.comment, next: 'start' }],
        });
    };

    static instance = new SimpleNumberMode();
}
