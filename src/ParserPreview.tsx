import { Button, Typography } from '@mui/material';
import { Column } from './components/Column';

export const ParserPreview: React.VFC = () => {
    return (
        <Column>
            <Typography variant={'h4'}>Preview</Typography>
            <Typography variant={'body1'}>
                Don't worry! You will be adding extra attacks or bonuses on the next page.
            </Typography>
            <Button>Create Template</Button>
        </Column>
    );
};
