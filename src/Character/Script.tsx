import { Card, FormControlLabel, Switch, Typography } from '@mui/material';
import type { Ace } from 'ace-builds';
import React from 'react';
import { Updater } from 'use-immer';
import { Editor } from '../editor/Editor';
import { collectIdentifiers, genYamlScriptVarialesMode } from '../editor/YamlScript';
import { CharacterScreenOption, CharacterState } from './Character';
import { Column } from './components/Column';
import isEqual from 'lodash/isEqual';
import { MathfinderTurnIntermediate } from '../mathfinder/squence';

interface Props {
    value: CharacterState['rawInput']['script'];
    onChange: (value: CharacterState['rawInput']['script']) => void;
    onParsed: (parsed: CharacterState['parsed']['script']) => void;
    option: CharacterScreenOption;
    setOption: Updater<CharacterScreenOption>;
}

const entended = ['base attack bonus', 'additional attack bonus', 'normal', 'extra bonus'] as const;

export const Script: React.VFC<Props> = props => {
    const { value, onChange, onParsed, option, setOption } = props;
    const [identifiers, setIdentifiers] = React.useState(new Set<string>());
    const [error, setError] = React.useState<Error | undefined>();
    const mode = React.useMemo(() => genYamlScriptVarialesMode([...identifiers, ...entended]).instance, [identifiers]);
    return (
        <Column width={{ xs: '100%', md: 800 }}>
            <Typography variant={'h4'}>Script</Typography>
            <FormControlLabel
                control={
                    <Switch
                        value={option.recalculateBAB}
                        onChange={(_, recalculateBAB) => setOption(option => ({ ...option, recalculateBAB }))}
                    />
                }
                label={'Recalculate BAB Automatically'}
            />
            <FormControlLabel
                control={
                    <Switch
                        value={option.expandStats}
                        onChange={(_, expandStats) => setOption(option => ({ ...option, expandStats }))}
                    />
                }
                label={'Expand Stats Section'}
            />
            <Editor
                mode={mode}
                placeholder={'ERROR! Please refresh!'}
                style={{ minHeight: 300, flexGrow: 1 }}
                value={value}
                onChange={value => onChange(value)}
                onTokenizerUpdate={(editor: { session: Ace.EditSession }) => {
                    const next = collectIdentifiers(editor);
                    if (isEqual(next, identifiers)) {
                        try {
                            onParsed(MathfinderTurnIntermediate.fromYaml(value, mode.getTokenizer()));
                        } catch (error) {
                            if (error instanceof Error) {
                                setError(error);
                            }
                        }
                    } else {
                        setIdentifiers(next);
                    }
                }}
            />
            {error && (
                <Card variant={'outlined'} color={'error.main'}>
                    {error.message}
                </Card>
            )}
        </Column>
    );
};
