import { InputAdornment, TextField, Typography } from '@mui/material';
import React from 'react';
import { Slide } from './components/Slide';

export const CriticalHit: React.VFC = () => {
    const [multiplier, setMultiplier] = React.useState('');
    const [range, setRange] = React.useState('');
    const [confirmationBonus, setConfirmationBonus] = React.useState('');
    return (
        <Slide gap={2}>
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
                }}
            />
            <TextField
                value={confirmationBonus}
                onChange={({ target: { value } }) => setConfirmationBonus(value)}
                label={'Confirmation Bonus'}
                type={'number'}
                fullWidth
                helperText={'Enter 99 for auto confirmation'}
            />
        </Slide>
    );
};
