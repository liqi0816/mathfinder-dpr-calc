import { FormControlLabel, Switch } from '@mui/material';
import { CharacterState } from './Character';
import { Column } from './components/Column';

export const reduceScript = (
    state: CharacterState['parsed']['script'],
    action: CharacterState['parsed']
): CharacterState['rawInput']['script'] => {
    return '';
};

interface Props {}

export const Script: React.VFC<Props> = props => {
    return (
        <Column width={{ xs: '100%', md: 800 }}>
            <FormControlLabel control={<Switch defaultChecked />} label={'Recalculate BAB Automatically'} />
            <FormControlLabel control={<Switch defaultChecked />} label={'Expand Stats Section'} />
        </Column>
    );
};
