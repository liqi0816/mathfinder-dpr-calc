import { Mode as TextMode } from 'ace-builds/src-noconflict/mode-text';

class DiceAndNumberCommentRules extends new TextMode().HighlightRules {
    $rules = {
        start: [
            { token: 'constant.numeric', regex: /^[+-]?\d+\b/ },
            { token: 'constant.numeric', regex: /^[+-]?\d*d\d+\b/ },
            { token: 'comment.line', regex: /\S.*$/ },
        ],
    };
}

export class DiceAndNumberCommentMode extends TextMode {
    HighlightRules = DiceAndNumberCommentRules;

    static instance = new DiceAndNumberCommentMode();
}
