import { Paper, Typography } from '@mui/material';
import React from 'react';
import { DiceAndNumberCommentMode } from '../editor/DiceAndNumber';
import { Editor, ReadonlyEditor } from '../editor/Editor';
import { iterateEditor } from '../editor/util';
import { parseBlock } from '../mathfinder/calculator';
import { CharacterState } from './Character';
import { Column } from './components/Column';

interface Props {
    value: CharacterState['rawInput']['damage'];
    onChange: (value: CharacterState['rawInput']['damage']) => void;
    onParsed: (parsed: CharacterState['parsed']['damage']) => void;
}

export const Damage: React.VFC<Props> = props => {
    const { value, onChange, onParsed } = props;
    const [parsed, setParsed] = React.useState<CharacterState['parsed']['damage']>({});
    React.useEffect(() => onParsed(parsed), [parsed, onParsed]);
    return (
        <Column>
            <Typography variant={'h4'}>Damage</Typography>
            <Paper variant={'outlined'} sx={{ padding: 1 }}>
                <Typography variant={'body1'}>Please list damages like this</Typography>
                <ReadonlyEditor
                    mode={DiceAndNumberCommentMode.instance}
                    value={'d8 Some damage description\n2d6 + 2 Bane\n5 Strength Bonus\n10 Deadly Aim'}
                />
            </Paper>
            <Typography variant={'h5'}>Multiplies on critical</Typography>
            <Typography variant={'body1'}>Power Attack, Enhancement, etc.</Typography>
            <Editor
                mode={DiceAndNumberCommentMode.instance}
                placeholder={'Please enter something here...'}
                style={{ minHeight: 200, flexGrow: 1 }}
                value={value.normal}
                onChange={normal => onChange({ ...value, normal })}
                onTokenizerUpdate={editor => setParsed(parsed => ({ ...parsed, normal: parseBlock(iterateEditor(editor)) }))}
            />
            <Typography variant={'h5'}>Does not multiply on critical</Typography>
            <Typography variant={'body1'}>Sneak, Elemental, etc</Typography>
            <Editor
                mode={DiceAndNumberCommentMode.instance}
                placeholder={'Please enter something here...'}
                style={{ minHeight: 200, flexGrow: 1 }}
                value={value['extra bonus']}
                onChange={extra => onChange({ ...value, 'extra bonus': extra })}
                onTokenizerUpdate={editor =>
                    setParsed(parsed => ({ ...parsed, 'extra bonus': parseBlock(iterateEditor(editor)) }))
                }
            />
        </Column>
    );
};
