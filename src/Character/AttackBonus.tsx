import { Paper, Typography } from '@mui/material';
import { Ace } from 'ace-builds';
import React from 'react';
import { Column } from './components/Column';
import { Editor, ReadonlyEditor } from '../editor/Editor';
import { SimpleNumberCommentMode } from '../editor/SimpleNumber';
import { CharacterState } from './Character';
import { parseBlock } from '../mathfinder/calculator';
import { iterateEditor } from '../editor/util';

interface Props {
    value: Pick<CharacterState['rawInput'], 'base attack bonus' | 'aditional attack bonus'>;
    onChange: (value: Pick<CharacterState['rawInput'], 'base attack bonus' | 'aditional attack bonus'>) => void;
    onParsed: (parsed: Pick<CharacterState['parsed'], 'base attack bonus' | 'aditional attack bonus'>) => void;
}

export const AttackBonus: React.VFC<Props> = props => {
    const { value, onChange, onParsed } = props;
    const [parsed, setParsed] = React.useState<Pick<CharacterState['parsed'], 'base attack bonus' | 'aditional attack bonus'>>(
        {}
    );
    React.useEffect(() => onParsed(parsed), [parsed, onParsed]);
    return (
        <Column>
            <Typography variant={'h4'}>Attack Bonus</Typography>
            <Typography variant={'h5'}>Base Attack Bonus</Typography>
            <Paper variant={'outlined'} sx={{ padding: 1 }}>
                <Typography variant={'body1'} fontStyle={'italic'}>
                    This may not equal to class level - please look up the progression table
                </Typography>
                <Typography variant={'body1'}>Please list progression like this</Typography>
                <ReadonlyEditor
                    mode={SimpleNumberCommentMode.instance}
                    value={'1 Some class description\n11 Eldritch Archer at Lv.15\n5 Eldritch Knight at Lv.5'}
                />
            </Paper>
            <Editor
                mode={SimpleNumberCommentMode.instance}
                placeholder={'Please enter something here...'}
                style={{ minHeight: 200, flexGrow: 1 }}
                value={value['base attack bonus']}
                onChange={base => onChange({ ...value, 'base attack bonus': base })}
                onTokenizerUpdate={editor =>
                    setParsed(parsed => ({ ...parsed, 'base attack bonus': parseBlock(iterateEditor(editor)) }))
                }
            />
            <Typography variant={'h5'}>Additional Attack Bonus</Typography>
            <Paper variant={'outlined'} sx={{ padding: 1 }}>
                <Typography variant={'body1'}>Please list bonuses like this</Typography>
                <ReadonlyEditor
                    mode={SimpleNumberCommentMode.instance}
                    value={'2 Some bonus description\n1 Weapon Focus\n-2 Rapid shot'}
                />
            </Paper>
            <Editor
                mode={SimpleNumberCommentMode.instance}
                placeholder={'Please enter something here...'}
                style={{ minHeight: 200, flexGrow: 1 }}
                value={value['aditional attack bonus']}
                onChange={aditional => onChange({ ...value, 'aditional attack bonus': aditional })}
                onTokenizerUpdate={editor =>
                    setParsed(parsed => ({ ...parsed, 'aditional attack bonus': parseBlock(iterateEditor(editor)) }))
                }
            />
        </Column>
    );
};
