import { Paper, Typography } from '@mui/material';
import { Ace } from 'ace-builds';
import React from 'react';
import { Column } from './components/Column';
import { DiceAndNumberCommentMode } from './editor/DiceAndNumber';
import { Editor, ReadonlyEditor } from './editor/Editor';
import { iterateEditor } from './editor/util';
import { NormalizedRow } from './state/calculator';

export const Damage: React.VFC = () => {
    const criticalEligibleEditor = React.useRef<Ace.Editor>();
    const flatEditor = React.useRef<Ace.Editor>();
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
                onLoad={editor => (criticalEligibleEditor.current = editor)}
                placeholder={'Please enter something here...'}
                style={{ minHeight: 200, flexGrow: 1 }}
            />
            <button
                onClick={() => {
                    if (!criticalEligibleEditor.current) return;
                    const block = iterateEditor(criticalEligibleEditor.current.session);
                    console.log(NormalizedRow.merge(NormalizedRow.fromBlock(block)).toString());
                }}
            >
                test
            </button>
            <Typography variant={'h5'}>Does not multiply on critical</Typography>
            <Typography variant={'body1'}>Sneak, Elemental, etc</Typography>
            <Editor
                mode={DiceAndNumberCommentMode.instance}
                onLoad={editor => (flatEditor.current = editor)}
                placeholder={'Please enter something here...'}
                style={{ minHeight: 200, flexGrow: 1 }}
            />
        </Column>
    );
};
