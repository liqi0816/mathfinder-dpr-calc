import { Button, Typography, Card, CardContent } from '@mui/material';
import { CharacterState } from './Character';
import { Column } from './components/Column';

interface Props {
    parsed: CharacterState['parsed'];
}

export const ParserPreview: React.VFC<Props> = props => {
    const { parsed } = props;
    return (
        <Column>
            <Typography variant={'h4'}>Preview</Typography>
            <Typography variant={'body1'}>
                Don't worry! You will be adding extra attacks or extra bonuses on the next page.
            </Typography>
            <Card>
                <CardContent></CardContent>
            </Card>
            <Button variant={'contained'}>Create Template</Button>
        </Column>
    );
};
