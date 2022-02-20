import * as ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-yaml';
import escapeRegExp from 'lodash/escapeRegExp';
import { makePerLineAware } from './BaseMode';
import { TokenType, typedRules } from './util';

const YamlHighlightRules = ace.require('ace/mode/yaml_highlight_rules').YamlHighlightRules;
const YamlMode = ace.require('ace/mode/yaml').Mode;

const template = new YamlHighlightRules().getRules() as Readonly<any>;

export function genYamlScriptVarialesMode(identifiers: (string | RegExp)[] = []) {
    return class YamlScriptMode extends makePerLineAware(YamlMode) {
        HighlightRules = class YamlScriptHighlightRules extends YamlHighlightRules {
            $rules = typedRules({
                ...template,
                start: [
                    {
                        regex: /^(\s*)(\w[\w\d ]*?)(:)(?!\n)(\s)/,
                        token: ['text', 'meta.tag', 'keyword', 'text'],
                        next: 'scriptStart',
                    },
                    ...template.start,
                ],
                scriptStart: [
                    { regex: /(same as)(\s)/, token: [TokenType.Operator, TokenType.Space] },
                    { regex: /(?=[+-])/, next: 'scriptOperator' },
                    { regex: /(?:)/, next: 'scriptTerm' },
                ],
                scriptOperator: [
                    { regex: /[+-]/, token: TokenType.Operator, next: 'scriptTerm' },
                    { regex: /(?=\S)/, token: TokenType.Comment, next: 'scriptComment' },
                    { regex: /\n/, next: 'start' },
                ],
                scriptTerm: [
                    { regex: /(\d*)(d\d+)/, token: [TokenType.Numeric, TokenType.Func], next: 'scriptOperator' },
                    { regex: /\d+/, token: TokenType.Numeric, next: 'scriptOperator' },
                    ...identifiers.map(regex => ({
                        regex: typeof regex === 'string' ? escapeRegExp(regex) : regex.source,
                        token: TokenType.Variable,
                        next: 'scriptOperator' as const,
                    })),
                    { regex: /(?=\S)/, token: TokenType.Comment, next: 'scriptComment' },
                    { regex: /\n/, next: 'start' },
                ],
                scriptComment: [{ regex: /.*/, token: TokenType.Space, next: 'start' }],
            });
        };

        static instance = new YamlScriptMode();
    };
}

export const YamlScriptMode = genYamlScriptVarialesMode();

export function collectIdentifiers({ session }: { session: ace.Ace.EditSession }) {
    const ret = new Set<string>();
    const lines = session.getLength();
    for (let i = 0; i < lines; i++) {
        for (const token of session.getTokens(i)) {
            if (token.type === 'meta.tag') {
                ret.add(token.value);
            }
        }
    }
    return ret;
}
