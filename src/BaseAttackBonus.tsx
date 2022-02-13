import { Typography } from '@mui/material';
import useId from '@mui/material/utils/useId';
import React from 'react';
import AceEditor from 'react-ace';
import { Slide } from './components/Slide';
import { SimpleNumberCommentMode } from './editor/SimpleNumber';

export const BaseAttackBonus: React.VFC = () => {
    const [value, setValue] = React.useState('');
    const exampleId = useId();
    const babId = useId();
    return (
        <Slide>
            <Typography variant={'h4'}>Base Attack Bonus</Typography>
            <Typography variant={'body1'}>List classes like this</Typography>
            <AceEditor
                mode={SimpleNumberCommentMode.instance}
                theme={'tomorrow'}
                name={exampleId}
                value={
                    '20 Some bonus description\n11 Eldritch Archer\n5 Eldritch Knight'
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
            <Typography variant={'body1'} marginTop={1}>
                We detected:{' '}
            </Typography>
            <AceEditor
                mode={SimpleNumberCommentMode.instance}
                theme={'tomorrow'}
                name={babId}
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
