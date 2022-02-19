import { Paper, Typography } from '@mui/material';
import React from 'react';
import { DiceAndNumberMode } from '../editor/DiceAndNumber';
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
    const parsed = React.useRef<CharacterState['parsed']['damage']>({});
    return (
        <Column>
            <Typography variant={'h4'}>Damage</Typography>
            <Paper variant={'outlined'} sx={{ padding: 1 }}>
                <Typography variant={'body1'}>Please list damages like this</Typography>
                <ReadonlyEditor
                    mode={DiceAndNumberMode.instance}
                    value={'d8 Some damage description\n2d6 + 2 Bane\n5 Strength Bonus\n10 Deadly Aim'}
                />
            </Paper>
            <Typography variant={'h5'}>Multiplies on Critical</Typography>
            <Typography variant={'body1'}>Power Attack, Enhancement, etc.</Typography>
            <Editor
                mode={DiceAndNumberMode.instance}
                placeholder={'Please enter something here...'}
                style={{ minHeight: 200, flexGrow: 1 }}
                value={value.normal}
                onChange={normal => onChange({ ...value, normal })}
                onTokenizerUpdate={editor =>
                    onParsed((parsed.current = { ...parsed.current, normal: parseBlock(iterateEditor(editor)) }))
                }
            />
            <Typography variant={'h5'}>Does Not Multiply on Critical</Typography>
            <Typography variant={'body1'}>Sneak, Elemental, etc</Typography>
            <Editor
                mode={DiceAndNumberMode.instance}
                placeholder={'Please enter something here...'}
                style={{ minHeight: 200, flexGrow: 1 }}
                value={value['extra bonus']}
                onChange={extra => onChange({ ...value, 'extra bonus': extra })}
                onTokenizerUpdate={editor =>
                    onParsed((parsed.current = { ...parsed.current, 'extra bonus': parseBlock(iterateEditor(editor)) }))
                }
            />
        </Column>
    );
};
