'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Checkbox,
  FormControlLabel,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
    train_filename?: string;
    train_filepath?: string;
    train_stats?: ProcessStats;
    test_filename?: string;
    test_filepath?: string;
    test_stats?: ProcessStats;
    all_filename?: string;
    scaler_path?: string;
    train_head?: any[];
    test_head?: any[];
  };
};

type InferenceResponse = {
  model_type: string;
  accuracy: number;
  precision_macro: number;
  recall_macro: number;
  f1_macro: number;
  precision_weighted: number;
  recall_weighted: number;
  f1_weighted: number;
  confusion_matrix: any;
  classification_report: any;
  num_predictions: number;
  sample_predictions: string[];
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

function ConfusionMatrixTable({ matrix }: { matrix?: any }) {
  if (!matrix) return null;
  let data: number[][] | null = null;
  if (Array.isArray(matrix)) data = matrix;
  else if (typeof matrix === 'object') {
    const labels = Object.keys(matrix).sort();
    data = labels.map((r) => labels.map((c) => Number(matrix?.[r]?.[c] ?? 0)));
  }
  if (!data) return null;
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
          {data.map((row, i) => (
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

export default function ModelsPage() {
  const [modelsMap, setModelsMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [csvs, setCsvs] = useState<string[]>([]);
  const [csvsLoading, setCsvsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inference dialog state
  const [open, setOpen] = useState(false);
  const [chosenMethod, setChosenMethod] = useState<string | null>(null);
  const [chosenModel, setChosenModel] = useState<string | null>(null);
  const [selectedCsvs, setSelectedCsvs] = useState<string[]>([]);
  const [proc, setProc] = useState<ProcessResponse['data'] | null>(null);
  const [processing, setProcessing] = useState(false);
  const [infRes, setInfRes] = useState<InferenceResponse | null>(null);
  const [infLoading, setInfLoading] = useState(false);

  const fetchModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/data/current_models`, { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      const text = await res.text();
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      setModelsMap(parsed || {});
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch models.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCsvs = async () => {
    try {
      setCsvsLoading(true);
      const res = await fetch(`${API_BASE}/data/current_csvs`, { cache: 'no-store' });
    const ok = res.ok;
      if (!ok) throw new Error(await res.text());
      const data: string[] = await res.json();
      setCsvs(data || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch datasets.');
    } finally {
      setCsvsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
    fetchCsvs();
  }, []);

  const openInference = (method: string, modelName: string) => {
    setChosenMethod(method);
    setChosenModel(modelName);
    setSelectedCsvs([]);
    setProc(null);
    setInfRes(null);
    setOpen(true);
  };

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
    setInfRes(null);
    try {
      const data = await processCsvForm(selectedCsvs, 'string');
      setProc(data.data);
    } catch (e: any) {
      setError(e?.message || 'Failed to process CSVs.');
    } finally {
      setProcessing(false);
    }
  };

  const runInference = async () => {
    if (!chosenMethod || !chosenModel || !proc?.all_filename) return;
    setInfLoading(true);
    setError(null);
    setInfRes(null);
    try {
      const params = new URLSearchParams();
      params.set('model_type', chosenMethod);
      params.set('model_name', chosenModel);
      params.append('list_csv_names', proc.all_filename);

      const res = await fetch(`${API_BASE}/ml/inference/?${params.toString()}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error(await res.text());
      const data: InferenceResponse = await res.json();
      setInfRes(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to run inference.');
    } finally {
      setInfLoading(false);
    }
  };

  const resetDialog = () => {
    setOpen(false);
    setChosenMethod(null);
    setChosenModel(null);
    setSelectedCsvs([]);
    setProc(null);
    setInfRes(null);
    setProcessing(false);
    setInfLoading(false);
  };

  const metrics = useMemo(() => {
    if (!infRes) return [];
    return [
      ['Accuracy', infRes.accuracy],
      ['Precision (macro)', infRes.precision_macro],
      ['Recall (macro)', infRes.recall_macro],
      ['F1 (macro)', infRes.f1_macro],
      ['Precision (weighted)', infRes.precision_weighted],
      ['Recall (weighted)', infRes.recall_weighted],
      ['F1 (weighted)', infRes.f1_weighted],
      ['Num predictions', infRes.num_predictions],
    ];
  }, [infRes]);

  return (
    <PageContainer title="Models" description="Browse models and run inference">
      <Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {Object.keys(modelsMap).length === 0 ? (
              <Typography color="text.secondary">No models found.</Typography>
            ) : (
              Object.entries(modelsMap).map(([method, names]) => (
                <Accordion key={method} defaultExpanded sx={{ mb: 1 }} disableGutters>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="h6">{method}</Typography>
                      <Chip size="small" label={`${names.length} model(s)`} />
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Card variant="outlined">
                      <CardContent>
                        <List dense>
                          {names.map((n) => (
                            <ListItem
                              key={n}
                              secondaryAction={
                                <Button variant="contained" size="small" onClick={() => openInference(method, n)}>
                                  Inference
                                </Button>
                              }
                            >
                              <ListItemText primary={n} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Grid>
        </Grid>
      </Box>

      <Dialog open={open} onClose={resetDialog} fullWidth maxWidth="lg">
        <DialogTitle>Inference</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Alert severity="info">
              Model: <strong>{chosenMethod}</strong> — <code>{chosenModel}</code>
            </Alert>

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
            </DashboardCard>

            {processing && <LinearProgress />}

            {proc ? (
              <>
                <DashboardCard title="2) Processed stats and preview (train/test)">
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <StatsBlock title="Train stats" stats={proc.train_stats} />
                      <PreviewTable rows={proc.train_head} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <StatsBlock title="Test stats" stats={proc.test_stats} />
                      <PreviewTable rows={proc.test_head} />
                    </Grid>
                  </Grid>
                  <Box mt={2}>
                    <Alert severity="success">
                      Processed file for inference: <strong>{proc.all_filename}</strong>
                    </Alert>
                  </Box>
                </DashboardCard>

                <DashboardCard title="3) Run inference">
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      onClick={runInference}
                      disabled={infLoading}
                    >
                      {infLoading ? 'Running...' : 'Run Inference'}
                    </Button>
                    {infLoading && <LinearProgress sx={{ flex: 1, alignSelf: 'center' }} />}
                  </Stack>
                </DashboardCard>
              </>
            ) : null}

            {infRes ? (
              <DashboardCard title="4) Results">
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Metrics
                        </Typography>
                        <Table size="small">
                          <TableBody>
                            {[
                              ['Accuracy', infRes.accuracy],
                              ['Precision (macro)', infRes.precision_macro],
                              ['Recall (macro)', infRes.recall_macro],
                              ['F1 (macro)', infRes.f1_macro],
                              ['Precision (weighted)', infRes.precision_weighted],
                              ['Recall (weighted)', infRes.recall_weighted],
                              ['F1 (weighted)', infRes.f1_weighted],
                              ['Num predictions', infRes.num_predictions],
                            ].map(([k, v]) => (
                              <TableRow key={String(k)}>
                                <TableCell>{k}</TableCell>
                                <TableCell>{typeof v === 'number' ? (v as number).toFixed(6) : String(v)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Confusion matrix
                    </Typography>
                    <ConfusionMatrixTable matrix={infRes.confusion_matrix} />
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
                      {JSON.stringify(infRes.classification_report, null, 2)}
                    </Box>
                  </Grid>
                </Grid>
              </DashboardCard>
            ) : null}

            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetDialog}>Close</Button>
          <Button
            variant="contained"
            onClick={resetDialog}
            disabled={!infRes}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}