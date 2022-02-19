import React from 'react';
import { CharacterState } from './Character';
import { Column } from './components/Column';

interface Props {
    parsed: CharacterState['parsed'];
}

export const Plot: React.VFC<Props> = props => {
    const { parsed } = props;
    const [script, setScript] = React.useState(parsed.script);
    React.useEffect(() => setScript(script => parsed.script ?? script), [parsed.script]);
    return <Column width={{ xs: '100%', md: 800 }} whiteSpace={'pre'}>{JSON.stringify(script, null, 4)}</Column>;
};
