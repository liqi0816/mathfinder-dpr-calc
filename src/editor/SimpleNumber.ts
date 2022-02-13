import { Mode as TextMode } from 'ace-builds/src-noconflict/mode-text';

class SimpleNumberCommentRules extends new TextMode().HighlightRules {
    $rules = {
        start: [
            { token: 'constant.numeric', regex: /^[+-]?\d+\b/ },
            { token: 'comment.line', regex: /\S.*$/ },
        ],
    };
}

export class SimpleNumberCommentMode extends TextMode {
    HighlightRules = SimpleNumberCommentRules;

    static instance = new SimpleNumberCommentMode();
}
