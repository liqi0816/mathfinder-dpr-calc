import { Button, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import React from 'react';
import { CharacterState } from './Character';
import { Column } from './components/Column';

interface Props {
    value: CharacterState['rawInput']['critical hit'];
    onChange: (value: CharacterState['rawInput']['critical hit']) => void;
    onParsed: (parsed: CharacterState['parsed']['critical hit']) => void;
}

export const CriticalHit: React.VFC<Props> = props => {
    const { value, onChange, onParsed } = props;
    const [parsed, setParsed] = React.useState<CharacterState['parsed']['critical hit']>({});
    React.useEffect(() => onParsed(parsed), [parsed, onParsed]);
    return (
        <Column gap={2}>
            <Typography variant={'h4'}>Critical Hit</Typography>
            <TextField
                label={'Multiplier'}
                value={value['multiplier']}
                onChange={({ target: { value: multiplier } }) => onChange({ ...value, multiplier })}
                type={'number'}
                fullWidth
                InputProps={{
                    startAdornment: <InputAdornment position={'start'}>x</InputAdornment>,
                    inputProps: { min: 1 },
                }}
            />
            <TextField
                label={'Range'}
                value={value['range']}
                onChange={({ target: { value: range } }) => onChange({ ...value, range })}
                type={'number'}
                fullWidth
                InputProps={{
                    endAdornment: <InputAdornment position={'end'}> to 20</InputAdornment>,
                    inputProps: { min: 1, max: 20 },
                }}
            />
            <TextField
                value={value['confirmation bonus']}
                onChange={({ target: { value: confirmation } }) => onChange({ ...value, 'confirmation bonus': confirmation })}
                label={'Confirmation Bonus'}
                type={'number'}
                fullWidth
            />
            <Stack direction={'row'} gap={1}>
                <Button variant={'outlined'} onClick={() => onChange({ ...value, 'confirmation bonus': '99' })}>
                    auto confirm
                </Button>
                <Button variant={'outlined'} onClick={() => onChange({ ...value, 'confirmation bonus': '-99' })}>
                    enemy immune to crit
                </Button>
            </Stack>
        </Column>
    );
};
