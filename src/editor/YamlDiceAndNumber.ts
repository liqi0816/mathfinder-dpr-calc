import * as ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-yaml';
import escapeRegExp from 'lodash/escapeRegExp';
import { makePerLineAware } from './BaseMode';
import { TokenType, typedRules } from './util';

const HighlightRules = ace.require('ace/mode/yaml_highlight_rules').YamlHighlightRules;
const YamlMode = ace.require('ace/mode/yaml').Mode;

const template = new HighlightRules().getRules() as Readonly<any>;

class YamlDiceAndNumberCommentRules extends HighlightRules {
    $rules = typedRules({
        ...template,
        start: [
            {
                token: ['text', 'meta.tag', 'keyword', 'text'],
                regex: /^(\s*)(\w[\w\d ]*?)(:)(?!\n)(\s)/,
                next: 'diceAndNumberStart',
            },
            ...template.start,
        ],
        diceAndNumberStart: [
            { regex: /(?=[+-])/, next: 'diceAndNumberOperator' },
            { regex: /(?:)/, next: 'diceAndNumberTerm' },
        ],
        diceAndNumberOperator: [
            { regex: /[+-]/, token: TokenType.operator, next: 'diceAndNumberTerm' },
            { regex: /(?=\S)/, token: TokenType.comment, next: 'diceAndNumberComment' },
            { regex: /\n/, next: 'start' },
        ],
        diceAndNumberTerm: [
            { regex: escapeRegExp('base attack bonus'), token: TokenType.variable, next: 'diceAndNumberOperator' },
            { regex: escapeRegExp('additional attack bonus'), token: TokenType.variable, next: 'diceAndNumberOperator' },
            { regex: escapeRegExp('normal'), token: TokenType.variable, next: 'diceAndNumberOperator' },
            { regex: escapeRegExp('extra bonus'), token: TokenType.variable, next: 'diceAndNumberOperator' },
            { regex: /bab\d+/, token: TokenType.variable, next: 'diceAndNumberOperator' },
            { regex: /(\d*)(d\d+)/, token: [TokenType.numeric, TokenType.func], next: 'diceAndNumberOperator' },
            { regex: /\d+/, token: TokenType.numeric, next: 'diceAndNumberOperator' },
            { regex: /(?=\S)/, token: TokenType.comment, next: 'diceAndNumberComment' },
            { regex: /\n/, next: 'start' },
        ],
        diceAndNumberComment: [{ regex: /.*/, token: TokenType.space, next: 'start' }],
    });
}

export class YamlDiceAndNumberCommentMode extends makePerLineAware(YamlMode) {
    HighlightRules = YamlDiceAndNumberCommentRules;

    static instance = new YamlDiceAndNumberCommentMode();
}
