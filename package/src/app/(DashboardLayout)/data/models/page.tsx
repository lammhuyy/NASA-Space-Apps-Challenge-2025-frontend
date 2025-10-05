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
    fetchModels();
    fetchCsvs();
  }, []);

  const openInference = (method: string, modelName: string) => {
    setChosenMethod(method);
    setChosenModel(modelName);
    setSelectedCsvs([]);
    setInfRes(null);
    setOpen(true);
  };

  const toggleSelected = (name: string) => {
    setSelectedCsvs((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  };

  const runInference = async () => {
    if (!chosenMethod || !chosenModel || selectedCsvs.length === 0) {
      setError('Choose a model and at least one dataset.');
      return;
    }
    setInfLoading(true);
    setError(null);
    setInfRes(null);
    try {
      const params = new URLSearchParams();
      params.set('model_type', chosenMethod);
      params.set('model_name', chosenModel);
      // Pass selected filenames directly; repeated list_csv_names params
      selectedCsvs.forEach((f) => params.append('list_csv_names', f));

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
    setInfRes(null);
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

            <DashboardCard title="Choose datasets (use raw filenames)">
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
              <Stack direction="row" spacing={2} mt={2}>
                <Button variant="outlined" onClick={() => setSelectedCsvs([])}>
                  Clear
                </Button>
                <Button variant="contained" onClick={runInference} disabled={selectedCsvs.length === 0 || infLoading}>
                  {infLoading ? 'Running...' : 'Run Inference'}
                </Button>
              </Stack>
            </DashboardCard>

            {infRes ? (
              <DashboardCard title="Results">
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Metrics
                        </Typography>
                        <Table size="small">
                          <TableBody>
                            {metrics.map(([k, v]) => (
                              <TableRow key={String(k)}>
                                <TableCell>{k}</TableCell>
                                <TableCell>{typeof v === 'number' ? v.toFixed(6) : String(v)}</TableCell>
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetDialog}>Close</Button>
          <Button variant="contained" onClick={resetDialog} disabled={!infRes}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}