import * as ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-yaml';

const HighlightRules = ace.require('ace/mode/yaml_highlight_rules').YamlHighlightRules;
const YamlMode = ace.require('ace/mode/yaml').Mode;

class YamlDiceAndNumberCommentRules extends HighlightRules {
    constructor() {
        super();
        this.$rules = {
            ...new HighlightRules().getRules(),
            diceAndNumberStart: [
                { regex: /(?=[d\d])/, next: 'diceAndNumberSpec' },
                { regex: /(?:)/, next: 'diceAndNumberMiddle' },
            ],
            diceAndNumberMiddle: [
                { token: 'keyword.operator', regex: /[+-]/, next: 'diceAndNumberSpec' },
                { token: 'comment.line', regex: /\S/, next: 'start' },
            ],
            diceAndNumberSpec: [
                {
                    token: ['constant.numeric', 'entity.name.function'],
                    regex: /(\d*)(d\d+)/,
                    next: 'diceAndNumberMiddle',
                },
                { token: 'constant.numeric', regex: /\d+/, next: 'diceAndNumberMiddle' },
            ],
        };
        for (const rule of this.$rules) {
            if (rule.token?.[0] === 'meta.tag' && rule.token?.[1] === 'keyword') {
                rule.next = 'diceAndNumberStart';
            }
        }
    }
}

export class YamlDiceAndNumberCommentMode extends YamlMode {
    HighlightRules = YamlDiceAndNumberCommentRules;
}
