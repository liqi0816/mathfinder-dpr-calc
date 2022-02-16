import * as ace from 'ace-builds';
import { BaseEditorMode } from './BaseMode';
import { typedRules } from './util';

const TextHighlightRules = ace.require('ace/mode/text_highlight_rules').TextHighlightRules;

export class DiceAndNumberCommentMode extends BaseEditorMode {
    HighlightRules = class extends TextHighlightRules {
        $rules = typedRules({
            start: [
                { regex: /(?=[d\d])/, next: 'term' },
                { regex: /(?:)/, next: 'operator' },
            ],
            operator: [
                { regex: /[+-]/, token: 'keyword.operator', next: 'term' },
                { regex: /(?=\S)/, token: 'comment.line', next: 'comment' },
                { regex: /\n/, next: 'start' },
            ],
            term: [
                {
                    regex: /(\d*)(d\d+)/,
                    token: ['constant.numeric', 'entity.name.function'],
                    next: 'operator',
                },
                { regex: /\d+/, token: 'constant.numeric', next: 'operator' },
                { regex: /\n/, next: 'start' },
            ],
            comment: [{ regex: /.*/, token: 'comment.line', next: 'start' }],
        });
    };

    static instance = new DiceAndNumberCommentMode();
}
