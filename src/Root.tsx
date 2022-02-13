import { Stack } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React from 'react';
import { BaseAttackBonus } from './BaseAttackBonus';

import 'react-ace';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/theme-github';
import { AdditionalAttackBonus } from './AdditionalAttackBonus';
import { CriticalHit } from './CriticalHit';

const theme = createTheme();

const Root: React.VFC = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Stack
                direction={'column'}
                flexWrap={'nowrap'}
                sx={{ minHeight: '100vh', gap: 10 }}
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
                        paddingX: { xs: 0, md: 10 },
                        flexGrow: 1,
                        gap: 1,
                    }}
                >
                    <BaseAttackBonus />
                    <AdditionalAttackBonus />
                    <CriticalHit />
                </Stack>
            </Stack>
        </ThemeProvider>
    );
};

export default Root;
