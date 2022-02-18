import * as ace from 'ace-builds';

const Mode = ace.require('ace/mode/text').Mode;
const Tokenizer = ace.require('ace/tokenizer').Tokenizer as new (..._: any) => any;

/**
 * rules may match for newline ('\n'), but the resulting tokens will have it removed
 */
class TokenizerPerLineAware extends Tokenizer {
    getLineTokens(line: string, startState: string | string[]) {
        // ace removes eol from line, so we need to add it back
        const ret: { tokens: { type: string; value: string }[]; state: string | string[] } = super.getLineTokens(
            `${line}\n`,
            startState
        );
        // however ace don't like it when the resulting token has mismatching length, so we need to remove eol
        const { tokens } = ret;
        const tailing = tokens[tokens.length - 1];
        if (tailing?.value.endsWith('\n')) {
            tailing.value = tailing.value.slice(0, -1);
        }
        return ret;
    }
}

export function makePerLineAware(mode: typeof Mode) {
    return class extends mode {
        getTokenizer() {
            if (!this.$tokenizer) {
                this.$highlightRules = this.$highlightRules || new this.HighlightRules(this.$highlightRuleConfig);
                this.$tokenizer = new TokenizerPerLineAware(this.$highlightRules.getRules());
            }
            return this.$tokenizer;
        }
    };
}

export const BaseEditorMode = makePerLineAware(Mode);
