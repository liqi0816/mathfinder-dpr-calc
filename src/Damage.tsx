import { Paper, Typography } from '@mui/material';
import React from 'react';
import AceEditor from 'react-ace';
import { Slide } from './components/Slide';
import useId from '@mui/material/utils/useId';
import { DiceAndNumberCommentMode } from './editor/DiceAndNumber';

export const AdditionalAttackBonus: React.VFC = () => {
    const [value, setValue] = React.useState('');
    const exampleId = useId();
    const criticalEligibleId = useId();
    const flatId = useId();
    return (
        <Slide>
            <Typography variant={'h4'}>Damage</Typography>
            <Paper>
                <Typography variant={'body1'}>List damage like this</Typography>
                <AceEditor
                    mode={DiceAndNumberCommentMode.mode}
                    theme={'tomorrow'}
                    name={exampleId}
                    value={
                        '1d8 Some damage description\n1 Weapon Focus\n-2 Rapid shot'
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
            <Typography variant={'body1'} marginTop={1}>
                We detected:{' '}
            </Typography>
            <AceEditor
                mode={DiceAndNumberCommentMode.mode}
                theme={'tomorrow'}
                name={criticalEligibleId}
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
