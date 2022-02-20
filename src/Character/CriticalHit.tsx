import { Button, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import React from 'react';
import { MathfinderPolynomial } from '../mathfinder/polynomial';
import { CharacterState } from './Character';
import { Column } from './components/Column';

interface Props {
    value: CharacterState['template']['input']['critical hit'];
    onChange: (value: Props['value']) => void;
    onParsed: (parsed: CharacterState['template']['partial']['critical hit']) => void;
}

export const CriticalHit: React.VFC<Props> = props => {
    const { value, onChange, onParsed } = props;
    const onParsedRef = React.useRef<Props['onParsed']>(onParsed);
    onParsedRef.current = onParsed;
    React.useEffect(
        () =>
            onParsedRef.current({
                multiplier: new MathfinderPolynomial(Number(value.multiplier)),
                range: new MathfinderPolynomial(Number(value.range)),
                'confirmation bonus': new MathfinderPolynomial(Number(value['confirmation bonus'])),
            }),
        [value]
    );
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
                <Button variant={'outlined'} onClick={() => onChange({ ...value, 'confirmation bonus': '999' })}>
                    auto confirm
                </Button>
                <Button variant={'outlined'} onClick={() => onChange({ ...value, 'confirmation bonus': '-999' })}>
                    enemy immune to crit
                </Button>
            </Stack>
        </Column>
    );
};
