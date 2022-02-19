import type { Ace } from 'ace-builds';
import { TokenType } from '../editor/util';
import type { BaseMode } from '../editor/BaseMode';
import { MathfinderPolynomial, MathfinderInputRow } from './calculator';
import yaml from 'js-yaml';
import merge from 'lodash/merge';
import isEqual from 'lodash/isEqual';
import { deepEntries, NestedHaystack } from './context';

export interface MathfinderTemplate {
    'base attack bonus': MathfinderPolynomial;
    'additional attack bonus': MathfinderPolynomial;
    damage: {
        normal: MathfinderPolynomial;
        'extra bonus': MathfinderPolynomial;
    };
    'critical hit': {
        multiplier: number;
        range: number;
        'confirmation bonus': number;
    };
}

export interface MathfinderTemplatePartial {
    'base attack bonus'?: MathfinderTemplate['base attack bonus'];
    'additional attack bonus'?: MathfinderTemplate['additional attack bonus'];
    damage?: Partial<MathfinderTemplate['damage']>;
    'critical hit'?: Partial<MathfinderTemplate['critical hit']>;
}

export function castMathfinderTemplate(partial: MathfinderTemplatePartial): MathfinderTemplate | undefined {
    if (!partial['base attack bonus']?.toAverage()) return;
    if (!partial.damage?.['normal']?.toAverage() && !partial.damage?.['extra bonus']?.toAverage()) return;
    return {
        'base attack bonus': partial['base attack bonus'],
        'additional attack bonus': partial['additional attack bonus'] ?? new MathfinderPolynomial(),
        damage: {
            normal: partial.damage['normal'] ?? new MathfinderPolynomial(),
            'extra bonus': partial.damage['extra bonus'] ?? new MathfinderPolynomial(),
        },
        'critical hit': {
            multiplier: partial['critical hit']?.multiplier ?? 1,
            range: partial['critical hit']?.range ?? 20,
            'confirmation bonus': partial['critical hit']?.['confirmation bonus'] ?? 0,
        },
    };
}

export interface MathfinderAction {
    name: string;
    'hit chance': MathfinderInputRow;
    damage: MathfinderInputRow;
}

export class MathfinderTurnError extends Error {
    name = MathfinderTurnError.name;
}

export class MathfinderTurnIntermediate {
    haystack: NestedHaystack<Iterable<Ace.Token>> = {};

    toNormalized(template?: MathfinderTemplatePartial) {

    }

    static fromYaml(yamlString: string, tokenizer: ReturnType<InstanceType<typeof BaseMode>['getTokenizer']>) {
        const ret = new MathfinderTurnIntermediate();
        const haystack = yaml.load(yamlString);

        if (!haystack || typeof haystack !== 'object') {
            throw new MathfinderTurnError('Please list actions like [name]: [value]\n(YAML shoule be a Record<string, string>)');
        }

        for (const [key, value, parent] of deepEntries(haystack as Record<string, unknown>)) {
            parent[key] = tokenizer.getLineTokens(String(value), 'scriptStart').tokens;
        }

        ret.haystack = haystack as NestedHaystack<Iterable<Ace.Token>>;

        return ret;
    }
}

function isIterable(value: any): value is Iterable<unknown> {
    return typeof value?.[Symbol.iterator] === 'function';
}
