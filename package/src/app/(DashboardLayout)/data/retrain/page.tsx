'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Stack,
  Alert,
  LinearProgress,
  Checkbox,
  FormControlLabel,
  TextField,
  MenuItem,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Card,
  CardContent,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

type ProcessStats = {
  num_samples?: number;
  num_features?: number;
  class_counts?: Record<string, number>;
  class_percentage?: Record<string, number>;
};

type ProcessResponse = {
  message: string;
  data: {
    train_filename: string;
    train_filepath: string;
    train_stats?: ProcessStats;
    test_filename: string;
    test_filepath: string;
    test_stats?: ProcessStats;
    all_filename?: string;
    scaler_path: string;
    train_head?: any[];
    test_head?: any[];
  };
};

type RetrainResponse = {
  message: string;
  results: Record<
    string,
    {
      accuracy: number;
      confusion_matrix: number[][];
      classification_report: any;
    }
  >;
};

const METHOD_CONFIGS: Record<
  string,
  { label: string; accepts: Array<'n_estimators' | 'max_depth' | 'learning_rate'> }
> = {
  randomforest: { label: 'Random Forest', accepts: ['n_estimators', 'max_depth'] },
  adaboost: { label: 'AdaBoost', accepts: ['n_estimators', 'learning_rate'] },
  stacking: { label: 'Stacking', accepts: [] },
  bagging: { label: 'Bagging', accepts: ['n_estimators'] },
  randomsubspace: { label: 'Random Subspace', accepts: ['n_estimators'] },
  rsm: { label: 'RSM', accepts: ['n_estimators'] },
  extratrees: { label: 'ExtraTrees', accepts: ['n_estimators', 'max_depth'] },
  extremelyrandomizedtrees: { label: 'Extremely Randomized Trees', accepts: ['n_estimators', 'max_depth'] },
  et: { label: 'ET (alias)', accepts: ['n_estimators', 'max_depth'] },
};

function PreviewTable({ rows, maxRows = 10 }: { rows?: any[]; maxRows?: number }) {
  if (!rows || rows.length === 0) return <Typography color="text.secondary">No preview available.</Typography>;
  const cols = Object.keys(rows[0] || {});
  return (
    <Box sx={{ overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {cols.map((c) => (
              <TableCell key={c}>{c}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.slice(0, maxRows).map((row, idx) => (
            <TableRow key={idx}>
              {cols.map((c) => (
                <TableCell key={c}>{String(row?.[c])}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

function StatsBlock({ title, stats }: { title: string; stats?: ProcessStats }) {
  if (!stats) return null;
  const { num_samples, num_features, class_counts, class_percentage } = stats;
  return (
    <DashboardCard title={title}>
      <Stack direction="row" spacing={2} flexWrap="wrap">
        <Chip color="primary" label={`Samples: ${num_samples ?? '-'}`} />
        <Chip color="secondary" label={`Features: ${num_features ?? '-'}`} />
      </Stack>
      <Box mt={2}>
        {class_counts ? (
          <>
            <Typography variant="subtitle2">Class counts</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
              {Object.entries(class_counts).map(([k, v]) => (
                <Chip key={k} label={`${k}: ${v}`} />
              ))}
            </Stack>
          </>
        ) : null}
      </Box>
      <Box mt={2}>
        {class_percentage ? (
          <>
            <Typography variant="subtitle2">Class percentage</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
              {Object.entries(class_percentage).map(([k, v]) => (
                <Chip key={k} variant="outlined" label={`${k}: ${v}%`} />
              ))}
            </Stack>
          </>
        ) : null}
      </Box>
    </DashboardCard>
  );
}

function ConfusionMatrixTable({ matrix }: { matrix?: number[][] }) {
  if (!matrix || !Array.isArray(matrix)) return null;
  const labels = ['0', '1'];
  return (
    <Box sx={{ overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            {labels.map((l) => (
              <TableCell key={l} align="center">
                Pred {l}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {matrix.map((row, i) => (
            <TableRow key={i}>
              <TableCell>True {labels[i] ?? i}</TableCell>
              {row.map((val, j) => (
                <TableCell key={j} align="center">
                  {val}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

async function processCsvForm(filenames: string[], option = 'string'): Promise<ProcessResponse> {
  const form = new URLSearchParams();
  filenames.forEach((f) => form.append('filenames', f));
  form.set('option', option);
  const res = await fetch(`${API_BASE}/data/process_csv/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: form.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`process_csv failed (${res.status}): ${text}`);
  }
  return res.json();
}

export default function RetrainPage() {
  const router = useRouter();

  const [csvs, setCsvs] = useState<string[]>([]);
  const [csvsLoading, setCsvsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCsvs, setSelectedCsvs] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [proc, setProc] = useState<ProcessResponse['data'] | null>(null);

  const [method, setMethod] = useState<string>('randomforest');
  const accepts = METHOD_CONFIGS[method]?.accepts || [];
  const [nEstimators, setNEstimators] = useState<number | ''>(100);
  const [maxDepth, setMaxDepth] = useState<number | ''>(10);
  const [learningRate, setLearningRate] = useState<number | ''>(0.1);

  const [retraining, setRetraining] = useState(false);
  const [retRes, setRetRes] = useState<RetrainResponse | null>(null);

  const fetchCsvs = async () => {
    try {
      setCsvsLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/data/current_csvs`, { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      const data: string[] = await res.json();
      setCsvs(data || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch datasets.');
    } finally {
      setCsvsLoading(false);
    }
  };

  useEffect(() => {
    fetchCsvs();
  }, []);

  const toggleSelected = (name: string) => {
    setSelectedCsvs((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  };

  const runProcess = async () => {
    if (selectedCsvs.length === 0) {
      setError('Please select at least one dataset.');
      return;
    }
    setProcessing(true);
    setError(null);
    setProc(null);
    setRetRes(null);
    try {
      const data = await processCsvForm(selectedCsvs, 'string');
      setProc(data.data);
    } catch (e: any) {
      setError(e?.message || 'Failed to process datasets.');
    } finally {
      setProcessing(false);
    }
  };

  // Build form-encoded payload as backend expects form fields, not JSON
  const buildForm = () => {
    if (!proc) return null;
    const form = new URLSearchParams();
    form.set('file_train', String(proc.train_filename));
    form.set('file_test', String(proc.test_filename));
    form.set('scaler_path', String(proc.scaler_path));
    form.set('models', String(method));
    if (accepts.includes('n_estimators') && nEstimators !== '' && !Number.isNaN(Number(nEstimators))) {
      form.set('n_estimators', String(Number(nEstimators)));
    }
    if (accepts.includes('max_depth') && maxDepth !== '' && !Number.isNaN(Number(maxDepth))) {
      form.set('max_depth', String(Number(maxDepth)));
    }
    if (accepts.includes('learning_rate') && learningRate !== '' && !Number.isNaN(Number(learningRate))) {
      form.set('learning_rate', String(Number(learningRate)));
    }
    return form;
  };

  const runRetrain = async () => {
    const form = buildForm();
    if (!form) {
      setError('Data not processed yet. Please process datasets first.');
      return;
    }
    setRetraining(true);
    setError(null);
    setRetRes(null);
    try {
      const res = await fetch(`${API_BASE}/train/retrain/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: form.toString(),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: RetrainResponse = await res.json();
      setRetRes(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to retrain model.');
    } finally {
      setRetraining(false);
    }
  };

  const resultKey = useMemo(() => {
    if (!retRes) return null;
    const keys = Object.keys(retRes.results || {});
    return keys[0] || null;
  }, [retRes]);

  const result = resultKey ? retRes?.results?.[resultKey] : null;

  return (
    <PageContainer title="Retrain" description="Prepare data and retrain a model">
      <Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <DashboardCard title="1) Choose datasets">
              {csvsLoading && <LinearProgress sx={{ mb: 2 }} />}
              {csvs.length === 0 ? (
                <Typography color="text.secondary">No datasets available.</Typography>
              ) : (
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  {csvs.map((name) => (
                    <FormControlLabel
                      key={name}
                      control={
                        <Checkbox
                          checked={selectedCsvs.includes(name)}
                          onChange={() => toggleSelected(name)}
                        />
                      }
                      label={name}
                    />
                  ))}
                </Stack>
              )}
              <Stack direction="row" spacing={1} mt={2}>
                <Button variant="outlined" onClick={() => setSelectedCsvs([])}>
                  Clear
                </Button>
                <Button variant="contained" onClick={runProcess} disabled={selectedCsvs.length === 0 || processing}>
                  Process selected
                </Button>
              </Stack>
              {processing && <LinearProgress sx={{ mt: 2 }} />}
            </DashboardCard>

            {proc ? (
              <>
                <Grid container spacing={2} mt={1}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <StatsBlock title="Train stats" stats={proc.train_stats} />
                    <PreviewTable rows={proc.train_head} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <StatsBlock title="Test stats" stats={proc.test_stats} />
                    <PreviewTable rows={proc.test_head} />
                  </Grid>
                </Grid>

                <DashboardCard title="2) Choose method and configure">
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Method"
                        value={method}
                        onChange={(e) => {
                          setRetRes(null);
                          setMethod(e.target.value);
                        }}
                      >
                        {Object.entries(METHOD_CONFIGS).map(([k, v]) => (
                          <MenuItem key={k} value={k}>
                            {v.label} ({k})
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    {accepts.includes('n_estimators') ? (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="n_estimators"
                          value={nEstimators}
                          onChange={(e) => setNEstimators(e.target.value === '' ? '' : Number(e.target.value))}
                          inputProps={{ min: 1, step: 1 }}
                        />
                      </Grid>
                    ) : null}
                    {accepts.includes('max_depth') ? (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="max_depth"
                          value={maxDepth}
                          onChange={(e) => setMaxDepth(e.target.value === '' ? '' : Number(e.target.value))}
                          inputProps={{ min: 1, step: 1 }}
                        />
                      </Grid>
                    ) : null}
                    {accepts.includes('learning_rate') ? (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="learning_rate"
                          value={learningRate}
                          onChange={(e) => setLearningRate(e.target.value === '' ? '' : Number(e.target.value))}
                          inputProps={{ min: 0.0001, step: 0.01 }}
                        />
                      </Grid>
                    ) : null}
                  </Grid>
                  <Stack direction="row" spacing={2} mt={2}>
                    <Button
                      variant="contained"
                      onClick={runRetrain}
                      disabled={retraining || !proc?.train_filename || !proc?.test_filename || !proc?.scaler_path}
                    >
                      {retraining ? 'Retraining...' : 'Start Retraining'}
                    </Button>
                    {retraining && <LinearProgress sx={{ flex: 1, alignSelf: 'center' }} />}
                  </Stack>
                </DashboardCard>
              </>
            ) : null}

            {retRes && result ? (
              <DashboardCard title="3) Results">
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Accuracy
                        </Typography>
                        <Typography variant="h5">{result.accuracy.toFixed(6)}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Confusion matrix
                    </Typography>
                    <ConfusionMatrixTable matrix={result.confusion_matrix} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Classification report (raw)
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        overflow: 'auto',
                        maxHeight: 300,
                        backgroundColor: 'background.paper',
                      }}
                    >
                      {JSON.stringify(result.classification_report, null, 2)}
                    </Box>
                  </Grid>
                </Grid>
              </DashboardCard>
            ) : null}

            <Stack direction="row" spacing={1} mt={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => router.push('/data/models')}>
                Back to Models
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push('/data/models')}
                disabled={!retRes}
              >
                Confirm
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}