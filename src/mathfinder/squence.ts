import type { Ace } from 'ace-builds';
import { TokenType } from '../editor/util';
import { MathfinderPolynomial, MathfinderInputRow } from './calculator';

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

export function castMathfinderTemplate(partial: MathfinderTemplatePartial) {
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
            multiplier: partial['critical hit']?.multiplier ?? 2,
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

interface MathfinderActionIntermediate {
    name: string;
    'hit chance': Iterable<Ace.Token>;
    damage: Iterable<Ace.Token>;
}

export class MathfinderTurn {
    static readonly statFields: ReadonlyArray<keyof MathfinderTemplatePartial> = [
        'base attack bonus',
        'additional attack bonus',
        'damage',
        'critical hit',
    ] as const;
    stat: MathfinderTemplatePartial = {};
    actions: MathfinderActionIntermediate[] = [];

    toNormalized(): MathfinderAction[] {
        return this.actions.map(action => {
            const ret = {
                name: action.name,
                'hit chance': MathfinderInputRow.fromRow(action['hit chance']),
                damage: MathfinderInputRow.fromRow(action.damage),
            };
            return ret;
        });
    }
}

function foo() {
    const context: Record<string, MathfinderInputRow> = {};
}
