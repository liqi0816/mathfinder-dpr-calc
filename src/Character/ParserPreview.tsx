import {
    Button,
    Card,
    List,
    ListItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import clamp from 'lodash/clamp';
import compact from 'lodash/compact';
import React from 'react';
import { MathfinderPolynomial } from '../mathfinder/calculator';
import { CharacterState, CharacterScriptTemplate } from './Character';
import { Column } from './components/Column';
import range from 'lodash/range';

interface Props {
    parsed: CharacterState['parsed'];
    template?: CharacterScriptTemplate;
    onTemplateConfirmed: (template: CharacterScriptTemplate) => void;
}

export const ParserPreview: React.VFC<Props> = props => {
    const { parsed, template, onTemplateConfirmed } = props;
    const { damage } = parsed;
    const totalDamage = React.useMemo(
        () => MathfinderPolynomial.merge(compact([damage?.['normal'], damage?.['extra bonus']])),
        [damage]
    );
    const { 'base attack bonus': base, 'additional attack bonus': additional } = parsed;
    const attackBonusesPerTurn = React.useMemo(() => {
        const additionalValue = additional?.toAverage() ?? 0;
        return range(base?.toAverage() ?? 0, 0, -5).map(baseValue => baseValue + additionalValue);
    }, [base, additional]);
    return (
        <Column>
            <Typography variant={'h4'}>Preview</Typography>
            <Typography variant={'body1'}>
                Don't worry! You will be adding extra attacks or extra bonuses on the next page.
            </Typography>
            <Typography variant={'h5'}>Typical Full Round Action Attack</Typography>
            <Typography variant={'body1'} fontStyle={'italic'}>
                ignoring critical hits
            </Typography>
            <TableContainer component={Card}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Attack Bonus</TableCell>
                            <TableCell>Damage</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {attackBonusesPerTurn.length ? (
                            attackBonusesPerTurn.map(attackBonus => (
                                <TableRow key={attackBonus}>
                                    <TableCell sx={{ color: 'secondary.main' }}>{attackBonus}</TableCell>
                                    <TableCell sx={{ color: 'primary.main' }}>{totalDamage.toString() || 'pending...'}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell sx={{ color: 'secondary.main' }}>{'pending...'}</TableCell>
                                <TableCell sx={{ color: 'primary.main' }}>{totalDamage.toString() || 'pending...'}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <Typography variant={'h5'}>Stats</Typography>
            <List dense>
                <ListItem>
                    <Typography variant={'body1'}>
                        Critical Hit:
                        {!!parsed['critical hit']?.['multiplier'] && (
                            <>
                                {' '}
                                <Typography color={'primary.main'} component={'span'}>
                                    x{parsed['critical hit']['multiplier']}
                                </Typography>
                            </>
                        )}
                        {!!parsed['critical hit']?.['range'] && (
                            <>
                                {' '}
                                <Typography color={'secondary.main'} component={'span'}>
                                    {clamp((21 - parsed['critical hit']['range']) * 5, 5, 95)}%
                                </Typography>
                            </>
                        )}
                        {!!parsed['critical hit']?.['confirmation bonus'] && (
                            <>
                                {' '}
                                <Typography color={'secondary.main'} component={'span'}>
                                    confirmation{parsed['critical hit']['confirmation bonus'] > 0 ? '+' : '-'}
                                    {Math.abs(parsed['critical hit']['confirmation bonus'])}
                                </Typography>
                            </>
                        )}
                        {!parsed['critical hit'] ||
                            (!Object.values(parsed['critical hit']).some(Boolean) && (
                                <>
                                    {' '}
                                    <Typography color={'primary.main'} component={'span'}>
                                        pending...
                                    </Typography>
                                </>
                            ))}
                    </Typography>
                    <Typography variant={'body1'}></Typography>
                </ListItem>
            </List>
            <Button variant={'contained'} disabled={!template} onClick={() => template && onTemplateConfirmed(template)}>
                Confirm Template
            </Button>
        </Column>
    );
};
