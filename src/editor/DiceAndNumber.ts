import 'ace-builds';
import { Mode as TextMode } from 'ace-builds/src-noconflict/mode-text';

class DiceAndNumberCommentRules extends new TextMode().HighlightRules {
    $rules = {
        start: [
            { regex: /(?=[d\d])/, next: 'spec' },
            { regex: /(?:)/, next: 'middle' },
        ],
        middle: [
            { token: 'keyword.operator', regex: /[+-]/, next: 'spec' },
            { token: 'comment.line', regex: /\S/, next: 'comment' },
        ],
        spec: [
            {
                token: ['constant.numeric', 'entity.name.function'],
                regex: /(\d*)(d\d+)/,
                next: 'middle',
            },
            { token: 'constant.numeric', regex: /\d+/, next: 'middle' },
        ],
        comment: [{ token: 'comment.line', regex: /.*$/, next: 'start' }],
    };
}

export class DiceAndNumberCommentMode extends TextMode {
    HighlightRules = DiceAndNumberCommentRules;

    static instance = new DiceAndNumberCommentMode();
}
