'use client';

import React, { useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Stack,
  Button,
  Typography,
  Alert,
  LinearProgress,
  Divider,
  Select,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

// Backend base URL from env; fallback to same-origin.
// Example: NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') || '';

type DataHeadRow = Record<string, string | number | null | undefined>;

type UploadCsvResp = {
  message: string;
  filename: string;
  filepath: string;
  data_head: DataHeadRow[];
};

type ProcessCsvResp = {
  message: string;
  train_filename: string;
  train_filepath: string;
  test_filename: string;
  test_filepath: string;
  train_head: DataHeadRow[];
  test_head: DataHeadRow[];
};

type InferenceResp = {
  model_type: number;
  accuracy: number;
  precision_macro: number;
  recall_macro: number;
  f1_macro: number;
  precision_weighted: number;
  recall_weighted: number;
  f1_weighted: number;
  confusion_matrix: Record<string, Record<string, number>>;
  classification_report: Record<
    string,
    | {
        precision?: number;
        recall?: number;
        ['f1-score']?: number;
        support?: number;
      }
    | number
  >;
  num_predictions: number;
  sample_predictions: string[];
};

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Bad JSON response: ${text?.slice(0, 500)}`);
  }
}

const API = {
  // POST /data/upload_csv/ (multipart form with file)
  uploadCsv: async (file: File): Promise<UploadCsvResp> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/data/upload_csv/`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Upload failed: ${res.status} ${res.statusText} ${body}`);
    }
    return safeJson(res);
  },

  // POST /data/process_csv/ (Form(...) => send multipart/form-data fields)
  processCsv: async (filename: string, option: string): Promise<ProcessCsvResp> => {
    const formData = new FormData();
    formData.append('filename', filename);
    formData.append('option', option);
    const res = await fetch(`${API_BASE}/data/process_csv/`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Process failed: ${res.status} ${res.statusText} ${body}`);
    }
    return safeJson(res);
  },

  // POST /ml/inference/ (Query(...) => send as URL params)
  runInference: async (
    model_type: number,
    train_path: string,
    test_path: string
  ): Promise<InferenceResp> => {
    const params = new URLSearchParams();
    params.set('model_type', String(model_type));
    params.set('train_path', train_path);
    params.set('test_path', test_path);

    const res = await fetch(`${API_BASE}/ml/inference/?${params.toString()}`, {
      method: 'POST',
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Inference failed: ${res.status} ${res.statusText} ${body}`);
    }
    return safeJson(res);
  },
};

// Reusable table to preview dataset head
function DataPreviewTable({
  rows,
  title,
  maxRows = 5,
}: {
  rows: DataHeadRow[];
  title: string;
  maxRows?: number;
}) {
  const cols = useMemo(() => (rows?.length ? Object.keys(rows[0]) : []), [rows]);
  const sliced = useMemo(() => rows?.slice(0, maxRows) ?? [], [rows, maxRows]);
  if (!rows || rows.length === 0) {
    return (
      <Alert severity="info" variant="outlined">
        No preview rows available.
      </Alert>
    );
  }
  return (
    <DashboardCard title={title}>
      <TableContainer component={Paper} sx={{ maxHeight: 360 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {cols.map((c) => (
                <TableCell key={c} sx={{ whiteSpace: 'nowrap' }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {c}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sliced.map((r, idx) => (
              <TableRow key={idx}>
                {cols.map((c) => (
                  <TableCell key={c}>
                    {r[c] === null || r[c] === undefined ? (
                      <Chip size="small" label="null" color="default" variant="outlined" />
                    ) : (
                      String(r[c])
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Showing up to {maxRows} rows. Total columns: {cols.length}
      </Typography>
    </DashboardCard>
  );
}

function MetricItem({ label, value }: { label: string; value: number }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6">{Number.isFinite(value) ? value.toFixed(4) : String(value)}</Typography>
    </Stack>
  );
}

function ConfusionMatrixTable({ matrix }: { matrix: InferenceResp['confusion_matrix'] }) {
  const classes = Object.keys(matrix || {});
  const predicted = classes.length ? Object.keys(matrix[classes[0]]) : [];
  return (
    <DashboardCard title="Confusion Matrix">
      {!classes.length ? (
        <Alert severity="info">No confusion matrix to display.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell />
                {predicted.map((p) => (
                  <TableCell key={p} align="center">
                    Pred {p}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.map((actual) => (
                <TableRow key={actual}>
                  <TableCell sx={{ fontWeight: 600 }}>Actual {actual}</TableCell>
                  {predicted.map((p) => (
                    <TableCell key={p} align="center">
                      {matrix[actual]?.[p] ?? 0}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DashboardCard>
  );
}

function ClassificationReportTable({
  report,
}: {
  report: InferenceResp['classification_report'];
}) {
  const classRows = Object.entries(report).filter(
    ([k, v]) => typeof v === 'object' && !['accuracy', 'macro avg', 'weighted avg'].includes(k)
  ) as [string, { precision?: number; recall?: number; ['f1-score']?: number; support?: number }][];
  const macro = report['macro avg'] as any;
  const weighted = report['weighted avg'] as any;
  const accuracy = report['accuracy'] as number | undefined;

  return (
    <DashboardCard title="Classification Report">
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Class</TableCell>
              <TableCell align="right">Precision</TableCell>
              <TableCell align="right">Recall</TableCell>
              <TableCell align="right">F1-score</TableCell>
              <TableCell align="right">Support</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classRows.map(([label, m]) => (
              <TableRow key={label}>
                <TableCell sx={{ fontWeight: 600 }}>{label}</TableCell>
                <TableCell align="right">{m.precision?.toFixed(4)}</TableCell>
                <TableCell align="right">{m.recall?.toFixed(4)}</TableCell>
                <TableCell align="right">{m['f1-score']?.toFixed(4)}</TableCell>
                <TableCell align="right">{m.support}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>accuracy</TableCell>
              <TableCell />
              <TableCell />
              <TableCell align="right">{Number(accuracy ?? 0).toFixed(4)}</TableCell>
              <TableCell align="right">
                {(typeof weighted === 'object' && weighted.support) || ''}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>macro avg</TableCell>
              <TableCell align="right">{macro?.precision?.toFixed(4)}</TableCell>
              <TableCell align="right">{macro?.recall?.toFixed(4)}</TableCell>
              <TableCell align="right">{macro?.['f1-score']?.toFixed(4)}</TableCell>
              <TableCell align="right">{macro?.support}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>weighted avg</TableCell>
              <TableCell align="right">{weighted?.precision?.toFixed(4)}</TableCell>
              <TableCell align="right">{weighted?.recall?.toFixed(4)}</TableCell>
              <TableCell align="right">{weighted?.['f1-score']?.toFixed(4)}</TableCell>
              <TableCell align="right">{weighted?.support}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardCard>
  );
}

const DataInferencePage = () => {
  // Steps: 0 upload -> 1 confirm/process -> 2 confirm/inference -> 3 results
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [uploadResp, setUploadResp] = useState<UploadCsvResp | null>(null);

  // Process state
  const [processOption, setProcessOption] = useState<string>('string');
  const [processResp, setProcessResp] = useState<ProcessCsvResp | null>(null);

  // Inference state
  const [modelType, setModelType] = useState<number>(0);
  const [inferResp, setInferResp] = useState<InferenceResp | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetAll = () => {
    setStep(0);
    setFile(null);
    setUploadResp(null);
    setProcessResp(null);
    setInferResp(null);
    setModelType(0);
    setProcessOption('string');
    setLoading(false);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please choose a CSV file to upload.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const resp = await API.uploadCsv(file);
      setUploadResp(resp);
      setStep(1);
    } catch (e: any) {
      setError(e?.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    if (!uploadResp?.filename) {
      setError('No uploaded file found.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const resp = await API.processCsv(uploadResp.filename, processOption);
      setProcessResp(resp);
      setStep(2);
    } catch (e: any) {
      setError(e?.message || 'Processing failed.');
    } finally {
           setLoading(false);
    }
  };

  const handleInference = async () => {
    if (!processResp?.train_filepath || !processResp?.test_filepath) {
      setError('Train/Test paths are missing.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const resp = await API.runInference(
        modelType,
        processResp.train_filepath,
        processResp.test_filepath
      );
      setInferResp(resp);
      setStep(3);
    } catch (e: any) {
      setError(e?.message || 'Inference failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Data Inference" description="Upload → Process → Inference">
      <Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <DashboardCard
              title="Pipeline"
              subtitle={`Backend: ${API_BASE || 'same-origin'} • Upload CSV, preview and confirm → Process → Inference`}
            >
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <Chip color={step >= 0 ? 'primary' : 'default'} label="1. Upload" variant={step === 0 ? 'filled' : 'outlined'} />
                <Chip color={step >= 1 ? 'primary' : 'default'} label="2. Process" variant={step === 1 ? 'filled' : 'outlined'} />
                <Chip color={step >= 2 ? 'primary' : 'default'} label="3. Inference" variant={step === 2 ? 'filled' : 'outlined'} />
                <Chip color={step >= 3 ? 'primary' : 'default'} label="4. Results" variant={step === 3 ? 'filled' : 'outlined'} />
                <Box flexGrow={1} />
                <Button onClick={resetAll}>Reset</Button>
              </Stack>
              {loading && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                </Box>
              )}
              {error && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                  </Alert>
                </Box>
              )}
            </DashboardCard>
          </Grid>

          {/* Step 0: Upload */}
          {step === 0 && (
            <Grid size={{ xs: 12 }}>
              <DashboardCard title="1. Upload CSV">
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    The CSV schema should match the expected format (rowid, kepid, kepoi_name, …).
                  </Typography>
                  <Button variant="outlined" component="label" disabled={loading}>
                    Choose File
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      hidden
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setFile(f);
                        setUploadResp(null);
                      }}
                    />
                  </Button>
                  <Typography variant="subtitle2">
                    Selected: {file ? file.name : 'No file selected'}
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button variant="contained" onClick={handleUpload} disabled={!file || loading}>
                      Upload and Preview
                    </Button>
                    <Button onClick={() => setFile(null)} disabled={loading}>
                      Clear
                    </Button>
                  </Stack>
                </Stack>
              </DashboardCard>
            </Grid>
          )}

          {/* Step 1: Preview upload and confirm process */}
          {step === 1 && uploadResp && (
            <>
              <Grid size={{ xs: 12, lg: 8 }}>
                <DataPreviewTable
                  rows={uploadResp.data_head}
                  title={`Uploaded Preview • ${uploadResp.filename}`}
                />
              </Grid>
              <Grid size={{ xs: 12, lg: 4 }}>
                <DashboardCard title="Confirm to Process">
                  <Stack spacing={2}>
                    <Alert severity="success" variant="outlined">
                      {uploadResp.message}
                    </Alert>
                    <Typography variant="body2" color="text.secondary">
                      Filepath: {uploadResp.filepath}
                    </Typography>
                    <TextField
                      label="Process option"
                      size="small"
                      value={processOption}
                      onChange={(e) => setProcessOption(e.target.value)}
                      helperText="Temporary free-form option string"
                    />
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        onClick={handleProcess}
                        disabled={loading}
                      >
                        Confirm and Process
                      </Button>
                      <Button variant="outlined" onClick={() => setStep(0)} disabled={loading}>
                        Back
                      </Button>
                    </Stack>
                  </Stack>
                </DashboardCard>
              </Grid>
            </>
          )}

          {/* Step 2: Preview processed train/test and confirm inference */}
          {step === 2 && processResp && (
            <>
              <Grid size={{ xs: 12, lg: 6 }}>
                <DataPreviewTable
                  rows={processResp.train_head}
                  title={`Train Preview • ${processResp.train_filename}`}
                />
              </Grid>
              <Grid size={{ xs: 12, lg: 6 }}>
                <DataPreviewTable
                  rows={processResp.test_head}
                  title={`Test Preview • ${processResp.test_filename}`}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <DashboardCard title="Confirm to Run Inference">
                  <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Train path
                      </Typography>
                      <Typography variant="subtitle2">{processResp.train_filepath}</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Test path
                      </Typography>
                      <Typography variant="subtitle2">{processResp.test_filepath}</Typography>
                    </Box>
                    <Box flexGrow={1} />
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <InputLabel id="model-type-label">Model Type</InputLabel>
                      <Select
                        labelId="model-type-label"
                        value={modelType}
                        label="Model Type"
                        onChange={(e) => setModelType(Number(e.target.value))}
                      >
                        <MenuItem value={0}>0 - Model A</MenuItem>
                        <MenuItem value={1}>1 - Model B</MenuItem>
                        <MenuItem value={2}>2 - Model C</MenuItem>
                        <MenuItem value={3}>3 - Model D</MenuItem>
                        <MenuItem value={4}>4 - Model E</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleInference}
                      disabled={loading}
                    >
                      Run Inference
                    </Button>
                    <Button variant="outlined" onClick={() => setStep(1)} disabled={loading}>
                      Back
                    </Button>
                  </Stack>
                </DashboardCard>
              </Grid>
            </>
          )}

          {/* Step 3: Results */}
          {step === 3 && inferResp && (
            <>
              <Grid size={{ xs: 12 }}>
                <DashboardCard
                  title="Inference Results"
                  subtitle={`Model Type: ${inferResp.model_type} • Predictions: ${inferResp.num_predictions}`}
                >
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Stack spacing={2}>
                        <MetricItem label="Accuracy" value={inferResp.accuracy} />
                        <MetricItem label="Precision (macro)" value={inferResp.precision_macro} />
                        <MetricItem label="Recall (macro)" value={inferResp.recall_macro} />
                        <MetricItem label="F1 (macro)" value={inferResp.f1_macro} />
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Stack spacing={2}>
                        <MetricItem
                          label="Precision (weighted)"
                          value={inferResp.precision_weighted}
                        />
                        <MetricItem
                          label="Recall (weighted)"
                          value={inferResp.recall_weighted}
                        />
                        <MetricItem
                          label="F1 (weighted)"
                          value={inferResp.f1_weighted}
                        />
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Sample predictions
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {inferResp.sample_predictions && inferResp.sample_predictions.length ? (
                          inferResp.sample_predictions.map((p, idx) => (
                            <Chip key={`${p}-${idx}`} label={p} size="small" />
                          ))
                        ) : (
                          <Typography variant="text.secondary" variantMapping={{ body2: 'p' }}>
                            No sample predictions.
                          </Typography>
                        )}
                      </Stack>
                      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        <Button variant="contained" onClick={resetAll}>
                          New Run
                        </Button>
                        <Button variant="outlined" onClick={() => setStep(2)}>
                          Back
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </DashboardCard>
              </Grid>

              <Grid size={{ xs: 12, lg: 6 }}>
                <ConfusionMatrixTable matrix={inferResp.confusion_matrix} />
              </Grid>
              <Grid size={{ xs: 12, lg: 6 }}>
                <ClassificationReportTable report={inferResp.classification_report} />
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default DataInferencePage;