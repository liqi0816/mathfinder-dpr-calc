import { FormControlLabel, Switch, Typography } from '@mui/material';
import { Editor } from '../editor/Editor';
import { iterateEditor } from '../editor/util';
import { YamlDiceAndNumberCommentMode } from '../editor/YamlDiceAndNumber';
import { CharacterScreenOption, CharacterState } from './Character';
import { Column } from './components/Column';

interface Props {
    value: CharacterState['rawInput']['script'];
    onChange: (value: CharacterState['rawInput']['script']) => void;
    onParsed: (parsed: CharacterState['parsed']['script']) => void;
    option: Pick<CharacterScreenOption, 'recalculateBAB' | 'expandStats'>;
    setOption: (option: Pick<CharacterScreenOption, 'recalculateBAB' | 'expandStats'>) => void;
}

export const Script: React.VFC<Props> = props => {
    const { value, onChange, onParsed, option, setOption } = props;
    return (
        <Column width={{ xs: '100%', md: 800 }}>
            <Typography variant={'h4'}>Script</Typography>
            <FormControlLabel
                control={
                    <Switch
                        value={option.recalculateBAB}
                        onChange={(_, recalculateBAB) => setOption({ ...option, recalculateBAB })}
                    />
                }
                label={'Recalculate BAB Automatically'}
            />
            <FormControlLabel
                control={
                    <Switch value={option.expandStats} onChange={(_, expandStats) => setOption({ ...option, expandStats })} />
                }
                label={'Expand Stats Section'}
            />
            <Editor
                mode={YamlDiceAndNumberCommentMode.instance}
                placeholder={'ERROR! Please refresh!'}
                style={{ minHeight: 300, flexGrow: 1 }}
                value={value}
                onChange={value => onChange(value)}
                onTokenizerUpdate={editor => console.log([...iterateEditor(editor)])}
            />
        </Column>
    );
};
