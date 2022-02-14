import { Paper, Typography } from '@mui/material';
import { Ace } from 'ace-builds';
import React from 'react';
import { Column } from './components/Column';
import { Editor, ReadonlyEditor } from './editor/Editor';
import { SimpleNumberCommentMode } from './editor/SimpleNumber';

export const AttackBonus: React.VFC = () => {
    const babEditor = React.useRef<Ace.Editor>();
    const abEditor = React.useRef<Ace.Editor>();
    return (
        <Column>
            <Typography variant={'h4'}>Attack Bonus</Typography>
            <Typography variant={'h5'}>Base Attack Bonus</Typography>
            <Paper variant={'outlined'} sx={{ padding: 1 }}>
                <Typography variant={'body1'} fontStyle={'italic'}>
                    This is not class level
                </Typography>
                <Typography variant={'body1'}>
                    Please look up the progression table of your classes and list bonuses like this
                </Typography>
                <ReadonlyEditor
                    mode={SimpleNumberCommentMode.instance}
                    value={'20 Some class description\n11 Eldritch Archer at Lv.15\n5 Eldritch Knight at Lv.5'}
                />
            </Paper>
            <Editor
                mode={SimpleNumberCommentMode.instance}
                onLoad={editor => (babEditor.current = editor)}
                placeholder={'Please enter something here...'}
                style={{ flexGrow: 1 }}
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
                onLoad={editor => (abEditor.current = editor)}
                placeholder={'Please enter something here...'}
                style={{ flexGrow: 1 }}
            />
        </Column>
    );
};
