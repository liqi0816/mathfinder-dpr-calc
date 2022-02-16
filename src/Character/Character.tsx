import { Stack } from '@mui/material';
import React from 'react';
import { useImmer } from 'use-immer';
import { NormalizedCalculation } from '../mathfinder/calculator';
import { NormalizedSequence } from '../mathfinder/squence';
import { AttackBonus } from './AttackBonus';
import { CriticalHit } from './CriticalHit';
import { Damage } from './Damage';
import { ParserPreview } from './ParserPreview';

export interface CharacterState {
    rawInput: {
        'base attack bonus': string;
        'additional attack bonus': string;
        damage: {
            normal: string;
            'extra bonus': string;
        };
        'critical hit': {
            multiplier: string;
            range: string;
            'confirmation bonus': string;
        };
        script: string;
    };
    parsed: {
        'base attack bonus'?: NormalizedCalculation;
        'additional attack bonus'?: NormalizedCalculation;
        damage: {
            normal?: NormalizedCalculation;
            'extra bonus'?: NormalizedCalculation;
        };
        'critical hit': {
            multiplier?: number;
            range?: number;
            'confirmation bonus'?: number;
        };
        script?: NormalizedSequence;
    };
}

export const Character: React.VFC = () => {
    const [state, setState] = useImmer<CharacterState>({
        rawInput: {
            'base attack bonus': '',
            'additional attack bonus': '',
            damage: {
                normal: '',
                'extra bonus': '',
            },
            'critical hit': {
                multiplier: '',
                range: '',
                'confirmation bonus': '',
            },
            script: '',
        },
        parsed: {
            damage: {},
            'critical hit': {},
        },
    });
    return (
        <Stack
            component={'main'}
            direction={{ xs: 'column', md: 'row' }}
            flexWrap={'nowrap'}
            justifyContent={'start'}
            sx={{
                overflowX: { xs: 'hidden', md: 'auto' },
                paddingX: { xs: 1, md: 10 },
                flexGrow: 1,
                gap: 2,
            }}
        >
            <AttackBonus
                value={state.rawInput}
                onChange={React.useCallback(
                    value =>
                        setState(draft => {
                            draft.rawInput['base attack bonus'] = value['base attack bonus'];
                            draft.rawInput['additional attack bonus'] = value['additional attack bonus'];
                        }),
                    [setState]
                )}
                onParsed={React.useCallback(
                    value =>
                        setState(draft => {
                            draft.parsed['base attack bonus'] = value['base attack bonus'];
                            draft.parsed['additional attack bonus'] = value['additional attack bonus'];
                        }),
                    [setState]
                )}
            />
            <Damage
                value={state.rawInput.damage}
                onChange={React.useCallback(value => setState(draft => void (draft.rawInput.damage = value)), [setState])}
                onParsed={React.useCallback(value => setState(draft => void (draft.parsed.damage = value)), [setState])}
            />
            <CriticalHit
                value={state.rawInput['critical hit']}
                onChange={React.useCallback(
                    value => setState(draft => void (draft.rawInput['critical hit'] = value)),
                    [setState]
                )}
                onParsed={React.useCallback(value => setState(draft => void (draft.parsed['critical hit'] = value)), [setState])}
            />
            {!state.rawInput.script && <ParserPreview parsed={state.parsed} />}
        </Stack>
    );
};
