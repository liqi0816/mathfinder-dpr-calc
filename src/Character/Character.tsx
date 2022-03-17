import { Stack } from '@mui/material';
import yaml from 'js-yaml';
import range from 'lodash/range';
import React from 'react';
import { ReplaceNestedType } from '../mathfinder/context';
import {
    castMathfinderTemplate,
    MathfinderTemplate,
    MathfinderTemplatePartial,
    MathfinderTurnIntermediate,
} from '../mathfinder/sequence';
import { AttackBonus } from './AttackBonus';
import { CriticalHit } from './CriticalHit';
import { Damage } from './Damage';
import { TemplatePreview } from './TemplatePreview';
import { Plot } from './Plot';
import { Script } from './Script';

export interface CharacterState {
    template: {
        input: ReplaceNestedType<MathfinderTemplate, string>;
        partial: MathfinderTemplatePartial;
    };
    script: {
        input: string;
        partial?: MathfinderTurnIntermediate;
    };
}

export interface CharacterScreenOption {
    recalculateBAB: boolean;
    expandStats: boolean;
}

export type CharacterScreenStage = 'template' | 'script';

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
    const [templateInput, setTemplateInput] = React.useState<CharacterState['template']['input']>({
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
    });
    const [templatePartial, setTemplatePartial] = React.useState<CharacterState['template']['partial']>({
        // predefine shape so `yaml.dump` has a stable output order
        // does not affect the actual calculation
        'base attack bonus': undefined,
        'additional attack bonus': undefined,
        damage: {
            normal: undefined,
            'extra bonus': undefined,
        },
        'critical hit': {
            multiplier: undefined,
            range: undefined,
            'confirmation bonus': undefined,
        },
    });
    const templateComplete = React.useMemo(() => castMathfinderTemplate(templatePartial), [templatePartial]);
    const [scriptInput, setScriptInput] = React.useState<CharacterState['script']['input']>('');
    const [scriptPartial, setScriptPartial] = React.useState<CharacterState['script']['partial']>();
    const [option, setOption] = React.useState<CharacterScreenOption>({
        recalculateBAB: false,
        expandStats: false,
    });
    const [stage, setStage] = React.useState<CharacterScreenStage>('template');
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
                value={templateInput}
                onChange={value =>
                    setTemplateInput(templateInput => ({
                        ...templateInput,
                        'base attack bonus': value['base attack bonus'],
                        'additional attack bonus': value['additional attack bonus'],
                    }))
                }
                onParsed={value =>
                    setTemplatePartial(templatePartial => ({
                        ...templatePartial,
                        'base attack bonus': value['base attack bonus'],
                        'additional attack bonus': value['additional attack bonus'],
                    }))
                }
            />
            <Damage
                value={templateInput.damage}
                onChange={value => setTemplateInput(templateInput => ({ ...templateInput, damage: value }))}
                onParsed={value => setTemplatePartial(templatePartial => ({ ...templatePartial, damage: value }))}
            />
            <CriticalHit
                value={templateInput['critical hit']}
                onChange={value => setTemplateInput(templateInput => ({ ...templateInput, 'critical hit': value }))}
                onParsed={value => setTemplatePartial(templatePartial => ({ ...templatePartial, 'critical hit': value }))}
            />
            {stage === 'template' ? (
                <TemplatePreview
                    partial={templatePartial}
                    complete={templateComplete}
                    onTemplateConfirmed={template => {
                        setScriptInput(genScriptTextFromTemplate(template));
                        setStage('script');
                    }}
                    onSkip={() => setStage('script')}
                />
            ) : (
                <>
                    <Script
                        value={scriptInput}
                        onChange={setScriptInput}
                        onParsed={setScriptPartial}
                        option={option}
                        setOption={setOption}
                        onBack={() => setStage('template')}
                    />
                    <Plot template={templatePartial} script={scriptPartial} />
                </>
            )}
        </Stack>
    );
};
