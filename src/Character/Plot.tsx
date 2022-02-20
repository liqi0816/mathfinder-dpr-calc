import {
    Alert,
    AlertTitle,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Link,
    Paper,
    Stack,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import yaml from 'js-yaml';
import range from 'lodash/range';
import startCase from 'lodash/startCase';
import React from 'react';
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ReadonlyEditor } from '../editor/Editor';
import { YamlScriptMode } from '../editor/YamlScript';
import { MathfinderTurn } from '../mathfinder/squence';
import { CharacterState } from './Character';
import { Column } from './components/Column';

const toFixed8 = (value: number = 0) => value.toFixed(8).replace(/([.][0-9]*[1-9])0+$|[.]0*$/, '$1');

const PLOT_STEPS = range(10, 61);
const PLOT_AXIS_LABEL = 'armorClass';
const PLOT_CURRENT_LABEL = 'Currently Editing';
type DataPoint = { [PLOT_AXIS_LABEL]: number } & { [_ in string]?: number };

const DebugDialog: React.FC<{ turn?: MathfinderTurn; data?: DataPoint[] }> = props => {
    const { turn, data, children } = props;
    const [armorClass, setArmorClass] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const onClose = React.useCallback(() => setOpen(false), []);
    const dataRepr = React.useMemo(() => {
        if (data?.[0]) {
            const keys = [PLOT_AXIS_LABEL, ...Object.keys(data[0]).filter(key => key !== PLOT_AXIS_LABEL)];
            return `${keys.join(',')}\n${data
                .map(point =>
                    keys
                        .map(key => point[key])
                        .map(toFixed8)
                        .join(',')
                )
                .join('\n')}`;
        }
    }, [data]);
    return (
        <>
            <Link sx={{ cursor: 'pointer' }} onClick={() => setOpen(true)} align={'right'}>
                {children}
            </Link>
            <Dialog open={open} onClose={onClose} scroll={'paper'} fullWidth>
                <DialogTitle>Export Data / Debug</DialogTitle>
                <DialogContent dividers>
                    <Stack direction={'column'} flexWrap={'nowrap'} gap={1}>
                        {dataRepr && (
                            <TextField
                                label={'Plot Data'}
                                value={dataRepr}
                                multiline
                                fullWidth
                                InputProps={{ readOnly: true }}
                            ></TextField>
                        )}
                        {turn && (
                            <TextField
                                label={'Test Against AC'}
                                value={armorClass}
                                onChange={({ target: { value } }) => setArmorClass(value)}
                                type={'number'}
                                fullWidth
                                InputProps={{ inputProps: { min: 0 } }}
                            />
                        )}
                        {turn && armorClass && (
                            <ReadonlyEditor
                                mode={YamlScriptMode.instance}
                                value={yaml.dump([...turn.simulateAgainstAC(Number(armorClass))])}
                            />
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const labelToRandomColor = (label: string) => {
    let hash = 0;
    for (var i = 0; i < label.length; i++) {
        hash = label.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 40%, 50%)`;
};

interface Props {
    template: CharacterState['template']['partial'];
    script: CharacterState['script']['partial'];
}

const tooltipFormatter = (value: unknown) =>
    typeof value === 'number' ? toFixed8(value) : Array.isArray(value) ? value.join(' ~ ') : value;
const tooltipLabelFormatter = (value: unknown) => (typeof value === 'number' ? `Enemy Armor Class: ${value}` : String(value));
export const Plot: React.VFC<Props> = props => {
    const { template, script: partial } = props;
    // if script parser fails, stick to the last successful attempt
    const [intermediate, setIntermediate] = React.useState(partial);
    React.useEffect(() => setIntermediate(intermediate => partial ?? intermediate), [partial]);
    // not everyone has an ultra wide screen lol
    const [fullScreen, setFullScreen] = React.useState(false);
    const ref = React.useRef<HTMLElement>();
    React.useEffect(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }), []);
    React.useEffect(() => {
        fullScreen && ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, [fullScreen]);
    // get turn may throw error
    const [error, setError] = React.useState<Error>();
    const turn = React.useMemo(() => {
        try {
            setError(undefined);
            if (!intermediate) return;
            const haystack = intermediate.toNormalized(template);
            return MathfinderTurn.fromHaystack(haystack);
        } catch (error) {
            if (error instanceof Error) {
                setError(error);
            }
        }
    }, [intermediate, template]);
    // generate data
    const label = PLOT_CURRENT_LABEL;
    const [existingData, setExistingData] = React.useState(() =>
        PLOT_STEPS.map((armorClass: number): DataPoint => ({ armorClass }))
    );
    const turnData = React.useMemo(() => turn && PLOT_STEPS.map(armorClass => turn.averageAgainstAC(armorClass)), [turn]);
    const data = React.useMemo(() => {
        return turnData && existingData.map((value, i) => ({ ...value, [label]: turnData[i] }));
    }, [existingData, turnData, label]);
    const [turnLabel, setTurnLabel] = React.useState('');
    return (
        <Column width={{ xs: '100%', md: fullScreen ? '90vw' : 800 }} ref={ref}>
            <Typography variant={'h4'}>Plot</Typography>
            <Typography variant={'body1'}>
                Congratulations! This plot shows expected average Damage Per Round by enemy Armor Class.
            </Typography>
            <Stack direction={'row'} flexWrap={'nowrap'} alignItems={'center'} justifyContent={'space-between'}>
                <FormControlLabel
                    control={<Switch value={fullScreen} onChange={(_, fullScreen) => setFullScreen(fullScreen)} />}
                    label={'Full Screen'}
                />
                <DebugDialog turn={turn} data={data}>
                    export data / debug
                </DebugDialog>
            </Stack>
            {error && (
                <Alert severity={'error'} sx={{ whiteSpace: 'pre-wrap', fontFamily: 'Consolas, monospace' }}>
                    <AlertTitle>Cannot calculate the input ({startCase(error.name)})</AlertTitle>
                    {error.message}
                </Alert>
            )}
            {turnData && data && (
                <>
                    <ResponsiveContainer width={'100%'} height={400}>
                        <LineChart data={data}>
                            {data[0] &&
                                Object.keys(data[0]).map(
                                    dataKey =>
                                        dataKey !== PLOT_AXIS_LABEL && (
                                            <Line
                                                type={'monotone'}
                                                stroke={labelToRandomColor(dataKey)}
                                                dataKey={dataKey}
                                                key={dataKey}
                                            />
                                        )
                                )}
                            <XAxis
                                label={{ value: 'Enemy Armor Class', position: 'insideBottomRight', offset: -5 }}
                                dataKey={PLOT_AXIS_LABEL}
                            />
                            <YAxis label={{ value: 'Damage Per Round', position: 'insideLeft', angle: -90 }} />
                            <Tooltip labelFormatter={tooltipLabelFormatter} formatter={tooltipFormatter} />
                            <Legend />
                        </LineChart>
                    </ResponsiveContainer>
                    <Typography variant={'h5'}>Comparison</Typography>
                    <Paper variant={'outlined'} sx={{ padding: 1 }}>
                        <Typography variant={'body1'}>Please give the current script a name so it stays in the plot.</Typography>
                    </Paper>
                    <Stack direction={'column'} flexWrap={'nowrap'} alignItems={'start'} gap={1}>
                        <TextField
                            label={'New Name'}
                            value={turnLabel}
                            onChange={({ target: { value: turnLabel } }) => setTurnLabel(turnLabel)}
                        />
                        <Button
                            variant={'contained'}
                            onClick={() =>
                                setExistingData(existingData =>
                                    existingData.map((value, i) => ({ ...value, [turnLabel]: turnData[i] }))
                                )
                            }
                        >
                            Add
                        </Button>
                    </Stack>
                </>
            )}
        </Column>
    );
};
