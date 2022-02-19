import * as ace from 'ace-builds';

const Tokenizer = ace.require('ace/tokenizer').Tokenizer as new (..._: any) => Omit<ace.Ace.Tokenizer, 'getLineTokens'> & {
    /**
     * incorrect type definition overwritten
     * @see https://github.com/ajaxorg/ace/blob/68b5029ed4c99f15ab40c59c66a4c8ecb19be5ba/lib/ace/tokenizer.js#L358
     */
    getLineTokens(..._: Parameters<ace.Ace.Tokenizer['getLineTokens']>): {
        tokens: ReturnType<ace.Ace.Tokenizer['getLineTokens']>;
        state: Parameters<ace.Ace.Tokenizer['getLineTokens']>[1];
    };
};

/**
 * rules may match for newline ('\n'), but the resulting tokens will have it removed
 */
class TokenizerPerLineAware extends Tokenizer {
    getLineTokens(line: string, startState: string | string[]) {
        // ace removes eol from line, so we need to add it back
        const ret = super.getLineTokens(`${line}\n`, startState);
        // however ace don't like it when the resulting token has mismatching length, so we need to remove eol again
        const { tokens } = ret;
        const tailing = tokens[tokens.length - 1];
        if (tailing?.value.endsWith('\n')) {
            tailing.value = tailing.value.slice(0, -1);
        }
        return ret;
    }
}

const Mode = ace.require('ace/mode/text').Mode as new (..._: any) => Omit<ace.Ace.SyntaxMode, 'getTokenizer'> & {
    getLineTokens(): InstanceType<typeof Tokenizer>;
};

export function makePerLineAware(mode: typeof Mode) {
    return class Mode extends mode {
        /**
         * @todo add `declare` when cra fixes https://github.com/facebook/create-react-app/issues/8918
         */
        private $tokenizer?: TokenizerPerLineAware;
        private $highlightRules?: any;
        private $highlightRuleConfig?: any;
        HighlightRules: any;

        /**
         * @see https://github.com/ajaxorg/ace/blob/94422a4a892495564c56089af85019a8f8f24673/lib/ace/mode/text.js#L54
         */
        getTokenizer() {
            if (!this.$tokenizer) {
                this.$highlightRules = this.$highlightRules || new this.HighlightRules(this.$highlightRuleConfig);
                this.$tokenizer = new TokenizerPerLineAware(this.$highlightRules.getRules());
            }
            return this.$tokenizer;
        }
    };
}

export const BaseMode = makePerLineAware(Mode);
