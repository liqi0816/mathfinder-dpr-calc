import { Paper, Typography } from '@mui/material';
import React from 'react';
import AceEditor from 'react-ace';
import { Slide } from './components/Slide';
import useId from '@mui/material/utils/useId';
import { SimpleNumberCommentMode } from './editor/SimpleNumber';

export const AdditionalAttackBonus: React.VFC = () => {
    const [value, setValue] = React.useState('');
    const exampleId = useId();
    const abId = useId();
    return (
        <Slide>
            <Typography variant={'h4'}>Additional Attack Bonus</Typography>
            <Paper variant={'outlined'} sx={{ padding: 1 }}>
                <Typography variant={'body1'}>
                    List bonuses like this
                </Typography>
                <AceEditor
                    mode={SimpleNumberCommentMode.mode}
                    theme={'tomorrow'}
                    name={exampleId}
                    value={
                        '2 Some bonus description\n1 Weapon Focus\n-2 Rapid shot'
                    }
                    readOnly
                    minLines={3}
                    maxLines={3}
                    fontSize={18}
                    showPrintMargin={false}
                    showGutter={false}
                    highlightActiveLine={false}
                    setOptions={{
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: false,
                        enableSnippets: false,
                        showLineNumbers: false,
                    }}
                    width={'100%'}
                    style={{ pointerEvents: 'none' }}
                />
            </Paper>
            <AceEditor
                mode={SimpleNumberCommentMode.mode}
                theme={'tomorrow'}
                name={abId}
                fontSize={18}
                showPrintMargin={false}
                showGutter={false}
                setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: false,
                    enableSnippets: false,
                    showLineNumbers: false,
                }}
                value={value}
                onChange={setValue}
                placeholder={'Please enter something here...'}
                width={'100%'}
                style={{ flexGrow: 1 }}
            />
        </Slide>
    );
};
