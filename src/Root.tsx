import { Stack } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React from 'react';
import { AttackBonus } from './AttackBonus';
import { CriticalHit } from './CriticalHit';
import { Damage } from './Damage';
import { ParserPreview } from './ParserPreview';

const theme = createTheme();

const Root: React.VFC = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Stack
                direction={'column'}
                flexWrap={'nowrap'}
                sx={{ height: '100vh', gap: { md: 2 } }}
            >
                <AppBar position={'relative'}>
                    <Toolbar>
                        <Typography variant={'h6'} color={'inherit'} noWrap>
                            MathFinder Damage Per Round Calculator
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Stack
                    component={'main'}
                    direction={{ xs: 'column', md: 'row' }}
                    flexWrap={'nowrap'}
                    justifyContent={'start'}
                    sx={{
                        overflowX: { xs: 'hidden', md: 'auto' },
                        paddingX: { xs: 1, md: 10 },
                        flexGrow: 1,
                        gap: 2,
                    }}
                >
                    <AttackBonus />
                    <Damage />
                    <CriticalHit />
                    <ParserPreview />
                </Stack>
            </Stack>
        </ThemeProvider>
    );
};

export default Root;
