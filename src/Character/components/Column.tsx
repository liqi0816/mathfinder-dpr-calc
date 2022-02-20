import { Stack } from '@mui/material';
import React from 'react';

export const Column: React.FC<React.ComponentProps<typeof Stack>> = React.forwardRef((props, ref) => {
    return (
        <Stack
            ref={ref}
            direction={'column'}
            flexWrap={'nowrap'}
            width={{ xs: '100%', md: 400 }}
            minHeight={{ md: '100%' }}
            gap={1}
            flexShrink={0}
            {...props}
        />
    );
});
