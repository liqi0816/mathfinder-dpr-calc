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
