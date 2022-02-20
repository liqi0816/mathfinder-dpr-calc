import type { Ace } from 'ace-builds';
import yaml from 'js-yaml';
import clamp from 'lodash/clamp';
import set from 'lodash/set';
import type { BaseMode } from '../editor/BaseMode';
import { deepEntries, deepPrefixEntries, fuzzyGet, NestedHaystack, OptionalNestedType } from './context';
import { MathfinderInputRow, MathfinderPolynomial } from './polynomial';

export interface MathfinderTemplate {
    // space in variable names to match yaml schema
    // I feel that quoting is better than two sets of names
    'base attack bonus': MathfinderPolynomial;
    'additional attack bonus': MathfinderPolynomial;
    damage: {
        normal: MathfinderPolynomial;
        'extra bonus': MathfinderPolynomial;
    };
    'critical hit': {
        multiplier: MathfinderPolynomial;
        range: MathfinderPolynomial;
        'confirmation bonus': MathfinderPolynomial;
    };
}

export type MathfinderTemplatePartial = OptionalNestedType<MathfinderTemplate>;

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
            multiplier: partial['critical hit']?.multiplier ?? new MathfinderPolynomial(1),
            range: partial['critical hit']?.range ?? new MathfinderPolynomial(20),
            'confirmation bonus': partial['critical hit']?.['confirmation bonus'] ?? new MathfinderPolynomial(),
        },
    };
}

export class MathfinderTurnError extends Error {
    name = MathfinderTurnError.name;
}

const isIterable = (value: any): value is Iterable<unknown> => typeof value?.[Symbol.iterator] === 'function';
const isPolynomial = (value: any): value is MathfinderPolynomial => value instanceof MathfinderPolynomial;

export class MathfinderTurnIntermediate {
    haystack: NestedHaystack<Iterable<Ace.Token>> = {};

    toNormalized(template?: MathfinderTemplatePartial) {
        const ret: NestedHaystack<MathfinderPolynomial> = { ...template };

        for (const [key, value] of deepPrefixEntries(this.haystack, isIterable as (value: any) => value is Iterable<Ace.Token>)) {
            const variableResolver = (token: Ace.Token) => fuzzyGet(ret, [...key, token.value], isPolynomial);
            const row = MathfinderInputRow.fromRow(value, variableResolver);
            set(ret, key, row);
        }

        return ret;
    }

    static fromYaml(yamlString: string, tokenizer: ReturnType<InstanceType<typeof BaseMode>['getTokenizer']>) {
        const ret = new MathfinderTurnIntermediate();
        const haystack = yaml.load(yamlString);

        if (!haystack || typeof haystack !== 'object') {
            throw new MathfinderTurnError(
                `Please list actions like [name]: [value]\n(YAML shoule be a Record<string, string>, got ${typeof haystack})`
            );
        }

        for (const [key, value, parent] of deepEntries(haystack as Record<string, unknown>)) {
            parent[key] = tokenizer.getLineTokens(String(value), 'scriptStart').tokens;
        }

        ret.haystack = haystack as NestedHaystack<Iterable<Ace.Token>>;

        return ret;
    }
}

interface MathfinderAction {
    name: string;
    'hit chance': MathfinderPolynomial;
    damage: MathfinderPolynomial;
}

const chanceD20Geq = (value: number) => clamp((21 - value) / 20, 0, 1);
const chanceD20Between = (min: number, max: number) => clamp((max - min) / 20, 0, 1);

export class MathfinderTurn {
    header: MathfinderTemplate;
    turn: MathfinderAction[];

    constructor(template: MathfinderTemplatePartial) {
        const header = castMathfinderTemplate(template);
        if (!header) {
            throw new MathfinderTurnError(
                `Please provide all essential stats\n(needs 'base attack bonus' and a non-zero 'damage')`
            );
        }
        this.header = header;
        this.turn = [];
    }

    static fromHaystack(haystack: NestedHaystack<MathfinderPolynomial>) {
        const ret = new MathfinderTurn(haystack);

        for (const [name, value] of Object.entries(haystack)) {
            if ('hit chance' in value || 'damage' in value) {
                const lastAction = ret.turn[ret.turn.length - 1];
                const hit = value['hit chance'] ?? lastAction?.['hit chance'];
                const damage = value.damage ?? lastAction?.damage;
                if (hit instanceof MathfinderPolynomial && damage instanceof MathfinderPolynomial) {
                    ret.turn.push({ name, 'hit chance': hit, damage: damage });
                }
            }
        }

        return ret;
    }

    *simulateAgainstAC(armorClass: number) {
        for (const action of this.turn) {
            const attackBonus = action['hit chance'].toAverage();
            // min = 2 because nat 1 always misses, max = 20 because nat 20 always hits
            const normalHitMinimal = clamp(armorClass - attackBonus, 2, 20);
            // min = normalHitMinimal because a roll of lower than 20 is not an automatic hit, and any attack roll that doesn’t result in a hit is not a threat
            // max = 20 because nat 20 always threats
            // normalHitMinimal <= 20 because clamp
            const criticalThreatMinimal = clamp(this.header['critical hit'].range.toAverage(), normalHitMinimal, 20);
            const criticalThreatChance = chanceD20Geq(criticalThreatMinimal);
            // min = 2 because nat 1 always misses, max = 20 because nat 20 always hits
            const criticalConfirmMinimal = clamp(
                armorClass - (attackBonus + this.header['critical hit']['confirmation bonus'].toAverage()),
                2,
                20
            );
            const criticalHitChance = criticalThreatChance * chanceD20Geq(criticalConfirmMinimal);
            const normalHitChance =
                chanceD20Between(normalHitMinimal, criticalThreatMinimal) + (criticalThreatChance - criticalHitChance);
            const normalHitDamage = action.damage.toAverage();
            const nonMultiplyingDamage = this.header.damage['extra bonus'].toAverage();
            const criticalHitDamage =
                this.header['critical hit'].multiplier.toAverage() * (normalHitDamage - nonMultiplyingDamage) +
                nonMultiplyingDamage;
            const averageDamage = normalHitChance * normalHitDamage + criticalHitChance * criticalHitDamage;
            yield {
                name: action.name,
                action,
                attackBonus,
                armorClass,
                normalHitMinimal,
                normalHitChance,
                normalHitDamage,
                criticalThreatMinimal,
                criticalThreatChance,
                criticalConfirmMinimal,
                criticalHitChance,
                criticalHitDamage,
                averageDamage,
            } as const;
        }
    }

    averageAgainstAC(armorClass: number) {
        let ret = 0;
        for (const { averageDamage } of this.simulateAgainstAC(armorClass)) {
            ret += averageDamage;
        }
        return ret;
    }
}
