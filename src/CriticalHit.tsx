import {
    Button,
    InputAdornment,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import React from 'react';
import { Column } from './components/Column';

export const CriticalHit: React.VFC = () => {
    const [multiplier, setMultiplier] = React.useState('');
    const [range, setRange] = React.useState('');
    const [confirmationBonus, setConfirmationBonus] = React.useState('');
    return (
        <Column gap={2}>
            <Typography variant={'h4'}>Critical Hit</Typography>
            <TextField
                label={'Multiplier'}
                value={multiplier}
                onChange={({ target: { value } }) => setMultiplier(value)}
                type={'number'}
                fullWidth
                InputProps={{
                    startAdornment: (
                        <InputAdornment position={'start'}>x</InputAdornment>
                    ),
                    inputProps: { min: 1 },
                }}
            />
            <TextField
                label={'Range'}
                value={range}
                onChange={({ target: { value } }) => setRange(value)}
                type={'number'}
                fullWidth
                InputProps={{
                    endAdornment: (
                        <InputAdornment position={'end'}> to 20</InputAdornment>
                    ),
                    inputProps: { min: 1, max: 20 },
                }}
            />
            <TextField
                value={confirmationBonus}
                onChange={({ target: { value } }) =>
                    setConfirmationBonus(value)
                }
                label={'Confirmation Bonus'}
                type={'number'}
                fullWidth
            />
            <Stack direction={'row'} gap={1}>
                <Button
                    variant={'contained'}
                    onClick={() => setConfirmationBonus('99')}
                >
                    auto confirm
                </Button>
                <Button
                    variant={'contained'}
                    onClick={() => setConfirmationBonus('-99')}
                >
                    enemy immune to crit
                </Button>
            </Stack>
        </Column>
    );
};
