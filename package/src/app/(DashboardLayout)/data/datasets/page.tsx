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
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { IconRefresh, IconUpload, IconInfoCircle } from '@tabler/icons-react';
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

type UploadResponse = {
  message: string;
  filename: string;
  filepath: string;
  data_head: any[];
};

function PreviewTable({ rows, maxRows = 10 }: { rows?: any[]; maxRows?: number }) {
  if (!rows || rows.length === 0) {
    return <Typography color="text.secondary">No preview available.</Typography>;
  }
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

async function processCsvForm(filenames: string[], option = 'string'): Promise<ProcessResponse> {
  const form = new URLSearchParams();
  // FastAPI commonly expects list fields as repeated keys in form-encoded bodies
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

export default function DatasetsPage() {
  const [csvs, setCsvs] = useState<string[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [procResp, setProcResp] = useState<ProcessResponse['data'] | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<UploadResponse | null>(null);

  const fetchCsvs = async () => {
    try {
      setLoadingList(true);
      setError(null);
      const res = await fetch(`${API_BASE}/data/current_csvs`, { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      const data: string[] = await res.json();
      setCsvs(data || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch datasets.');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchCsvs();
  }, []);

  const onSelectDataset = async (name: string) => {
    setSelected(name);
    setProcessing(true);
    setProcResp(null);
    setError(null);
    try {
      const data = await processCsvForm([name], 'string');
      setProcResp(data.data);
    } catch (e: any) {
      setError(e?.message || 'Failed to process CSV.');
    } finally {
      setProcessing(false);
    }
  };

  const onUploadFile = async (file: File) => {
    setUploading(true);
    setUploadPreview(null);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/data/upload_csv/`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) throw new Error(await res.text());
      const data: UploadResponse = await res.json();
      setUploadPreview(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to upload CSV.');
    } finally {
      setUploading(false);
    }
  };

  const onConfirmUpload = async () => {
    setUploadOpen(false);
    setUploadPreview(null);
    await fetchCsvs();
  };

  const detailsTitle = useMemo(() => {
    if (!selected) return 'Details';
    return `Details: ${selected}`;
  }, [selected, procResp]);

  return (
    <PageContainer title="Datasets" description="Manage datasets: view details and import CSVs">
      <Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <DashboardCard
              title="Datasets"
              action={
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Refresh">
                    <span>
                      <IconButton onClick={fetchCsvs} disabled={loadingList}>
                        <IconRefresh />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Button
                    variant="contained"
                    startIcon={<IconUpload size={18} />}
                    onClick={() => setUploadOpen(true)}
                  >
                    Import CSV
                  </Button>
                </Stack>
              }
            >
              {loadingList && <LinearProgress sx={{ mb: 2 }} />}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {csvs.length === 0 ? (
                <Typography color="text.secondary">No datasets found.</Typography>
              ) : (
                <List dense>
                  {csvs.map((name) => (
                    <ListItem key={name} disablePadding secondaryAction={<IconInfoCircle size={16} />}>
                      <ListItemButton selected={selected === name} onClick={() => onSelectDataset(name)}>
                        <ListItemText primary={name} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </DashboardCard>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Card elevation={9}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h5">{detailsTitle}</Typography>
                  {selected ? (
                    <Button onClick={() => setSelected(null)} variant="outlined" size="small">
                      Back to list
                    </Button>
                  ) : null}
                </Stack>
                {processing && <LinearProgress sx={{ mb: 2 }} />}
                {!selected ? (
                  <Typography color="text.secondary">Select a dataset to view details.</Typography>
                ) : procResp ? (
                  <Stack spacing={2}>
                    <StatsBlock title="Train stats" stats={procResp.train_stats} />
                    <PreviewTable rows={procResp.train_head} />
                    <Divider />
                    <StatsBlock title="Test stats" stats={procResp.test_stats} />
                    <PreviewTable rows={procResp.test_head} />
                  </Stack>
                ) : error ? (
                  <Alert severity="error">{error}</Alert>
                ) : (
                  <Typography color="text.secondary">Preparing details...</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Import a new dataset (CSV)</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Button variant="outlined" component="label" disabled={uploading}>
              Choose CSV
              <input
                hidden
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUploadFile(f);
                }}
              />
            </Button>
            {uploading && <LinearProgress />}
            {uploadPreview ? (
              <Stack spacing={2}>
                <Alert severity="success">
                  {uploadPreview.message} — {uploadPreview.filename}
                </Alert>
                <Typography variant="h6">Preview</Typography>
                <PreviewTable rows={uploadPreview.data_head} />
              </Stack>
            ) : (
              <Typography color="text.secondary">Select a CSV to upload and preview.</Typography>
            )}
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!uploadPreview || uploading}
            onClick={onConfirmUpload}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}