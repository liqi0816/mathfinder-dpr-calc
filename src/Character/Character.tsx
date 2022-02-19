import { Stack } from '@mui/material';
import yaml from 'js-yaml';
import range from 'lodash/range';
import React from 'react';
import { useImmer } from 'use-immer';
import { MathfinderPolynomial } from '../mathfinder/calculator';
import { castMathfinderTemplate, MathfinderTemplate, MathfinderTurnIntermediate } from '../mathfinder/squence';
import { AttackBonus } from './AttackBonus';
import { CriticalHit } from './CriticalHit';
import { Damage } from './Damage';
import { ParserPreview } from './ParserPreview';
import { Plot } from './Plot';
import { Script } from './Script';

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
        'base attack bonus'?: MathfinderPolynomial;
        'additional attack bonus'?: MathfinderPolynomial;
        damage?: {
            normal?: MathfinderPolynomial;
            'extra bonus'?: MathfinderPolynomial;
        };
        'critical hit'?: {
            multiplier?: number;
            range?: number;
            'confirmation bonus'?: number;
        };
        script?: MathfinderTurnIntermediate;
    };
}

export interface CharacterScreenOption {
    recalculateBAB: boolean;
    expandStats: boolean;
    skipTemplateConfirmation: boolean;
}

const genScriptTextFromTemplate = (template: MathfinderTemplate): string => {
    const baseValue = template['base attack bonus'].toAverage();
    return yaml.dump(
        Object.fromEntries([
            [
                `bab${baseValue}`,
                {
                    'hit chance': 'base attack bonus + additional attack bonus',
                    damage: 'normal + extra bonus',
                },
            ],
            ...range(baseValue - 5, 0, -5).map(value => [
                `bab${value}`,
                {
                    'hit chance': `bab${value + 5} - 5`,
                },
            ]),
        ])
    );
};

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
                multiplier: '2',
                range: '20',
                'confirmation bonus': '',
            },
            script: '',
        },
        parsed: {},
    });
    const [option, setOption] = useImmer<CharacterScreenOption>({
        recalculateBAB: false,
        expandStats: false,
        skipTemplateConfirmation: false,
    });
    const template = React.useMemo(() => castMathfinderTemplate(state.parsed), [state.parsed]);
    return (
        <Stack
            component={'main'}
            direction={{ xs: 'column', md: 'row' }}
            flexWrap={'nowrap'}
            justifyContent={'start'}
            sx={{
                overflowX: { xs: 'hidden', md: 'auto' },
                overflowY: 'auto',
                paddingX: { xs: 1, md: 10 },
                paddingTop: { md: 2 },
                flexGrow: 1,
                gap: 2,
            }}
        >
            <AttackBonus
                value={state.rawInput}
                onChange={value =>
                    setState(draft => {
                        draft.rawInput['base attack bonus'] = value['base attack bonus'];
                        draft.rawInput['additional attack bonus'] = value['additional attack bonus'];
                    })
                }
                onParsed={value =>
                    setState(draft => {
                        draft.parsed['base attack bonus'] = value['base attack bonus'];
                        draft.parsed['additional attack bonus'] = value['additional attack bonus'];
                    })
                }
            />
            <Damage
                value={state.rawInput.damage}
                onChange={value => setState(draft => void (draft.rawInput.damage = value))}
                onParsed={value => setState(draft => void (draft.parsed.damage = value))}
            />
            <CriticalHit
                value={state.rawInput['critical hit']}
                onChange={value => setState(draft => void (draft.rawInput['critical hit'] = value))}
                onParsed={value => setState(draft => void (draft.parsed['critical hit'] = value))}
            />
            {!(state.rawInput.script || option.skipTemplateConfirmation) ? (
                <ParserPreview
                    parsed={state.parsed}
                    template={template}
                    onTemplateConfirmed={template =>
                        setState(draft => void (draft.rawInput['script'] = genScriptTextFromTemplate(template)))
                    }
                    setOption={setOption}
                />
            ) : (
                <>
                    <Script
                        value={state.rawInput.script}
                        onChange={value => setState(draft => void (draft.rawInput.script = value))}
                        onParsed={value => setState(draft => void (draft.parsed.script = value))}
                        option={option}
                        setOption={setOption}
                    />
                    <Plot parsed={state.parsed} />
                </>
            )}
        </Stack>
    );
};
