import { Alert, AlertTitle, FormControlLabel, Switch, Typography } from '@mui/material';
import type { Ace } from 'ace-builds';
import isEqual from 'lodash/isEqual';
import startCase from 'lodash/startCase';
import React from 'react';
import { Editor } from '../editor/Editor';
import { collectIdentifiers, genYamlScriptVarialesMode } from '../editor/YamlScript';
import { MathfinderTurnIntermediate } from '../mathfinder/squence';
import { CharacterScreenOption, CharacterState } from './Character';
import { Column } from './components/Column';

interface Props {
    value: CharacterState['script']['input'];
    onChange: (value: CharacterState['script']['input']) => void;
    onParsed: (parsed: CharacterState['script']['partial']) => void;
    option: CharacterScreenOption;
    setOption: React.Dispatch<React.SetStateAction<CharacterScreenOption>>;
}

const entended = ['base attack bonus', 'additional attack bonus', 'normal', 'extra bonus'];

export const Script: React.VFC<Props> = props => {
    const { value, onChange, onParsed, option, setOption } = props;
    const [identifiers, setIdentifiers] = React.useState(new Set<string>());
    const [error, setError] = React.useState<Error>();
    const mode = React.useMemo(() => genYamlScriptVarialesMode([...identifiers, ...entended]).instance, [identifiers]);
    return (
        <Column width={{ xs: '100%', md: 600 }}>
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
                placeholder={'Please list actions like [name]: [value], or use the template generator.'}
                style={{ minHeight: 300, flexGrow: 1 }}
                value={value}
                onChange={value => onChange(value)}
                onTokenizerUpdate={(editor: { session: Ace.EditSession }) => {
                    const next = collectIdentifiers(editor);
                    if (!isEqual(next, identifiers)) {
                        setIdentifiers(next);
                    } else {
                        try {
                            onParsed(MathfinderTurnIntermediate.fromYaml(value, mode.getTokenizer()));
                            setError(undefined);
                        } catch (error) {
                            if (error instanceof Error) {
                                setError(error);
                            }
                        }
                    }
                }}
            />
            {error && (
                <Alert severity={'error'} sx={{ whiteSpace: 'pre-wrap' }}>
                    <AlertTitle>Cannot understand the input ({startCase(error.name)})</AlertTitle>
                    {error.message}
                </Alert>
            )}
        </Column>
    );
};
