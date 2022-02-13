export interface RawInput {
    baseAttackBonus: string;
    additionalAttackBonus: string;
    critialHit: {
        multiplier: string;
        range: string;
        confirmationBonus: string;
    };
    damage: {
        criticalEligible: string;
        flatBonus: string;
    };
}

export function parseListOfNumbers(input: string): number[] {
    return input
        .split('\n')
        .map(s =>
            s.match(/^(?:always|infinity)/i) ? Infinity : parseInt(s, 10)
        );
}

export interface Damage {
    criticalEligible: number;
    flatBonus: number;
}

export interface CriticalHit {
    multiplier: number;
    range: number;
    confirmationBonus: number;
}

export interface Attack {
    attackBonus: number;
    damage: Damage;
}

export type Turn = Attack[];
