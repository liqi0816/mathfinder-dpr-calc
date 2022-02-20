import { Alert, AlertTitle } from '@mui/material';
import { CategoryScale, Chart, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { startCase } from 'lodash';
import range from 'lodash/range';
import React from 'react';
import { Line } from 'react-chartjs-2';
import { MathfinderTurn } from '../mathfinder/squence';
import { CharacterState } from './Character';
import { Column } from './components/Column';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
    template: CharacterState['template']['partial'];
    script: CharacterState['script']['partial'];
}

export const Plot: React.VFC<Props> = props => {
    const { template, script: partial } = props;
    // if script parser fails, stick to the last successful attempt
    const [intermediate, setIntermediate] = React.useState(partial);
    React.useEffect(() => setIntermediate(intermediate => partial ?? intermediate), [partial]);
    // not everyone has an ultra wide screen lol
    const ref = React.useRef<HTMLElement>();
    React.useEffect(() => ref.current?.scrollIntoView({ behavior: 'smooth' }), []);
    const [error, setError] = React.useState<Error>();
    const data = React.useMemo<React.ComponentProps<typeof Line>['data'] | undefined>(() => {
        try {
            if (!intermediate) return;
            const labels = range(10, 60);
            const haystack = intermediate.toNormalized(template);
            const turn = MathfinderTurn.fromHaystack(haystack);
            return {
                labels,
                datasets: [
                    {
                        label: 'current editing',
                        data: labels.map(ac => turn.averageAgainstAC(ac)),
                    },
                ],
            };
        } catch (error) {
            if (error instanceof Error) {
                setError(error);
            }
        }
    }, [intermediate, template]);
    return (
        <Column width={{ xs: '100%', md: 800 }} whiteSpace={'pre'} ref={ref}>
            {error && (
                <Alert severity={'error'} sx={{ whiteSpace: 'pre-wrap' }}>
                    <AlertTitle>Cannot calculate the input ({startCase(error.name)})</AlertTitle>
                    {error.message}
                </Alert>
            )}
            {data && (
                <Line
                    options={{
                        responsive: true,
                        interaction: { mode: 'index', intersect: false },
                        plugins: { legend: { position: 'bottom' } },
                    }}
                    data={data}
                />
            )}
        </Column>
    );
};
