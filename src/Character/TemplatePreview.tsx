import { Button, Link, List, ListItem, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import clamp from 'lodash/clamp';
import compact from 'lodash/compact';
import range from 'lodash/range';
import React from 'react';
import { MathfinderPolynomial } from '../mathfinder/polynomial';
import { MathfinderTemplate } from '../mathfinder/squence';
import { CharacterState } from './Character';
import { Column } from './components/Column';

interface Props {
    partial: CharacterState['template']['partial'];
    complete?: MathfinderTemplate;
    onTemplateConfirmed: (template: MathfinderTemplate) => void;
    onSkip: () => void;
}

export const TemplatePreview: React.VFC<Props> = props => {
    const { partial, complete, onTemplateConfirmed, onSkip } = props;
    const { damage } = partial;
    const totalDamage = React.useMemo(
        () => MathfinderPolynomial.merge(compact([damage?.['normal'], damage?.['extra bonus']])),
        [damage]
    );
    const { 'base attack bonus': base, 'additional attack bonus': additional } = partial;
    const attackBonusesPerTurn = React.useMemo(() => {
        const additionalValue = additional?.toAverage() ?? 0;
        return range(base?.toAverage() ?? 0, 0, -5).map(baseValue => baseValue + additionalValue);
    }, [base, additional]);
    const { 'critical hit': partialCritical } = partial;
    const critical = React.useMemo(
        () => ({
            multiplier: partialCritical?.multiplier?.toAverage() || undefined,
            range: partialCritical?.range?.toAverage() || undefined,
            'confirmation bonus': partialCritical?.['confirmation bonus']?.toAverage() || undefined,
        }),
        [partialCritical]
    );
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
            <Typography variant={'h5'}>Stats</Typography>
            <List dense>
                <ListItem>
                    <Typography variant={'body1'}>
                        <>
                            Critical Hit:
                            {critical['multiplier'] && (
                                <>
                                    {' '}
                                    <Typography color={'primary.main'} component={'span'}>
                                        x{critical['multiplier']}
                                    </Typography>
                                </>
                            )}
                            {critical['range'] && (
                                <>
                                    {' '}
                                    <Typography color={'secondary.main'} component={'span'}>
                                        {clamp((21 - critical['range']) * 5, 5, 95)}%
                                    </Typography>
                                </>
                            )}
                            {critical['confirmation bonus'] && (
                                <>
                                    {' '}
                                    <Typography color={'secondary.main'} component={'span'}>
                                        confirmation{critical['confirmation bonus'] > 0 ? '+' : '-'}
                                        {Math.abs(critical['confirmation bonus'])}
                                    </Typography>
                                </>
                            )}
                            {!critical ||
                                (!Object.values(critical).some(Boolean) && (
                                    <>
                                        {' '}
                                        <Typography color={'primary.main'} component={'span'}>
                                            pending...
                                        </Typography>
                                    </>
                                ))}
                        </>
                    </Typography>
                </ListItem>
                <ListItem>
                    <Typography variant={'body1'}>
                        {'Average Normal Damage: '}
                        <Typography color={'secondary.main'} component={'span'}>
                            {totalDamage.toAverage()}
                        </Typography>
                    </Typography>
                </ListItem>
                <ListItem>
                    <Typography variant={'body1'}>
                        {'Average Critical Damage: '}
                        <Typography color={'secondary.main'} component={'span'}>
                            {(damage?.['normal']?.toAverage() ?? 0) * (critical?.['multiplier'] ?? 1) +
                                (damage?.['extra bonus']?.toAverage() ?? 0) || 'pending...'}
                        </Typography>
                    </Typography>
                </ListItem>
            </List>
            <Button variant={'contained'} disabled={!complete} onClick={() => complete && onTemplateConfirmed(complete)}>
                Confirm Template
            </Button>
            <Link sx={{ cursor: 'pointer' }} onClick={onSkip}>
                skip
            </Link>
        </Column>
    );
};
