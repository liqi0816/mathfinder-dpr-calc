import { Alert, AlertTitle, Divider, FormControlLabel, Link, Paper, Stack, Switch, Typography } from '@mui/material';
import type { Ace } from 'ace-builds';
import isEqual from 'lodash/isEqual';
import startCase from 'lodash/startCase';
import React from 'react';
import { Editor, ReadonlyEditor } from '../editor/Editor';
import { collectIdentifiers, genYamlScriptVarialesMode, YamlScriptMode } from '../editor/YamlScript';
import { MathfinderTurnIntermediate } from '../mathfinder/sequence';
import { CharacterScreenOption, CharacterState } from './Character';
import { Column } from './components/Column';

interface Props {
    value: CharacterState['script']['input'];
    onChange: (value: CharacterState['script']['input']) => void;
    onParsed: (parsed: CharacterState['script']['partial']) => void;
    option: CharacterScreenOption;
    setOption: React.Dispatch<React.SetStateAction<CharacterScreenOption>>;
    onBack: () => void;
}

const extended = ['base attack bonus', 'additional attack bonus', 'normal', 'extra bonus'];

export const Script: React.VFC<Props> = props => {
    const { value, onChange, onParsed, option, setOption, onBack } = props;
    const [identifiers, setIdentifiers] = React.useState(new Set<string>());
    const [error, setError] = React.useState<Error>();
    const mode = React.useMemo(() => genYamlScriptVarialesMode([...identifiers, ...extended]).instance, [identifiers]);
    return (
        <Column width={{ xs: '100%', md: 600 }}>
            <Typography variant={'h4'}>Script</Typography>
            <Paper variant={'outlined'} sx={{ padding: 1 }}>
                <Typography variant={'body1'} fontStyle={'italic'}>
                    For geeks: We are using the YAML format. Variables will be resolved to the nearest tag. Basic add, minus, and
                    dice arithmetic will be computed.
                </Typography>
                <Typography variant={'body1'}>
                    This script describes your turn. Feel free to append or add extra attacks like this:
                </Typography>
                <ReadonlyEditor mode={YamlScriptMode.instance} value={'attack name:\n  hit chance: 17\n  damage: d3 + 5'} />
            </Paper>
            <Stack direction={'row'} flexWrap={'nowrap'} alignItems={'center'} justifyContent={'space-between'}>
                <FormControlLabel
                    control={
                        <Switch
                            value={option.expandStats}
                            onChange={(_, expandStats) => setOption(option => ({ ...option, expandStats }))}
                        />
                    }
                    label={'Add Stats Section'}
                />
                <Link sx={{ cursor: 'pointer' }} onClick={onBack}>
                    back to template
                </Link>
            </Stack>
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
                            setError(undefined);
                            const parsed = MathfinderTurnIntermediate.fromYaml(value, mode.getTokenizer());
                            onParsed(parsed);
                        } catch (error) {
                            if (error instanceof Error) {
                                setError(error);
                            }
                        }
                    }
                }}
            />
            {error && (
                <Alert severity={'error'} sx={{ whiteSpace: 'pre-wrap', fontFamily: 'Consolas, monospace' }}>
                    <AlertTitle>Cannot understand the input ({startCase(error.name)})</AlertTitle>
                    {error.message}
                </Alert>
            )}
        </Column>
    );
};
