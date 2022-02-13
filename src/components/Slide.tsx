import { Stack } from '@mui/material';
import React from 'react';

export const Slide: React.FC<Parameters<typeof Stack>[0]> = props => {
    return (
        <Stack
            direction={'column'}
            flexWrap={'nowrap'}
            width={{ xs: '100%', md: 400 }}
            height={{ xs: 300, md: '100%' }}
            gap={1}
            flexShrink={0}
            {...props}
        />
    );
};
