'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Grid,
  Stack,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  CardActions,
  Divider,
  Avatar,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  IconRocket,
  IconUsersGroup,
  IconStars,
  IconHeartHandshake,
  IconNotebook,
  IconArrowRight,
  IconCircleCheck,
} from '@tabler/icons-react';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

// Simple section wrapper
function Section({
  id,
  title,
  subtitle,
  children,
  gutter = true,
}: {
  id?: string;
  title?: string | React.ReactNode;
  subtitle?: string;
  children?: React.ReactNode;
  gutter?: boolean;
}) {
  return (
    <Box id={id} sx={{ py: gutter ? 6 : 0 }}>
      {(title || subtitle) && (
        <Stack spacing={1} mb={3}>
          {title ? (
            typeof title === 'string' ? (
              <Typography variant="h4" fontWeight={800}>
                {title}
              </Typography>
            ) : (
              title
            )
          ) : null}
          {subtitle ? (
            <Typography variant="subtitle1" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Stack>
      )}
      {children}
    </Box>
  );
}

export default function HomeIntroPage() {
  // Team members placeholder data (replace with real names/photos)
  const team = [
    {
      name: 'Nguyen Phan Hoang Bach',
      role: 'ML Lead',
      focus: [
        'Model selection',
        'Training pipeline',
        'Evaluation protocol',
      ],
      fun: '“Chasing periodicity in noise since sophomore year.”',
    },
    {
      name: 'Nguyen Nam Quan',
      role: 'Data Engineer',
      focus: [
        'ETL from Kepler/K2/TESS',
        'Preprocessing',
        'Feature stores',
      ],
      fun: '“Make the data sing before the model dances.”',
    },
    {
      name: 'Nguyen Thanh Hai',
      role: 'Visualization Lead',
      focus: [
        'Orbit rendering',
        'Linked light curve interactions',
        'Visual patterns',
      ],
      fun: '“If you can see it, you can question it.”',
    },
    {
      name: 'Dinh Ho Gia Huy',
      role: 'UX Engineer',
      focus: [
        'Interaction design',
        'Accessibility',
        'Responsive patterns',
      ],
      fun: '“Interfaces that teach while you explore.”',
    },
    {
      name: 'Nguyen Le Thinh Phuc',
      role: 'Infra/DevOps',
      focus: [
        'CI/CD',
        'Experiment tracking',
        'Scalable storage',
      ],
      fun: '“Pipelines that don’t wake you at 3 a.m.”',
    },
    {
      name: 'Nguyen Ngoc Lam Huy',
      role: 'Product/Research',
      focus: [
        'Domain alignment',
        'Documentation',
        'Community outreach',
      ],
      fun: '“Turning curiosity into roadmaps.”',
    },
  ];

  // Principles grid content
  const principles = [
    {
      title: 'See the Orbit, Trust the Model',
      text:
        'We pair real-time orbital visualizations with model outputs so users can verify what the AI thinks against what the physics shows.',
    },
    {
      title: 'Make Reproducibility the Default',
      text:
        'Every result links back to datasets, preprocessing, and model versions—so findings are not just impressive, they’re repeatable.',
    },
    {
      title: 'Build for Scientists, Invite Everyone',
      text:
        'Expert workflows for dataset/model management; approachable visuals for students and citizen scientists.',
    },
    {
      title: 'Modular by Design',
      text:
        'Pluggable datasets, interchangeable models, portable pipelines—scale from a single light curve to mission-scale catalogs.',
    },
    {
      title: 'Data Dignity',
      text:
        'Clear provenance and audit trails for every experiment, from raw light curves to tuned hyperparameters.',
    },
    {
      title: 'Curiosity with Discipline',
      text:
        'We prototype fast, validate rigorously, and document like a mission.',
    },
  ];

  // Feature cards
  const features = [
    {
      title: 'Real-Time Orbit Visualizer',
      bullets: [
        'Multi-planet star systems with adjustable inclinations and periods',
        'Transit alignment overlays; eclipse markers',
        'Linked charts: flux vs. time, phase-folded views',
      ],
    },
    {
      title: 'Exoplanet Database Explorer',
      bullets: [
        'Search Kepler, K2, TESS by KOI/EPIC/TIC, period, radius, SNR',
        'Quick-compare candidates vs. false positives',
      ],
    },
  ];
  const features2 = [
    {
      title: 'ML Studio',
      bullets: [
        'Dataset composer (merge, filter, augment)',
        'Model bring-your-own (upload weights/config)',
        'Training dashboard with metrics, confusion matrices, ROC',
      ],
    },
    {
      title: 'Provenance & Reproducibility',
      bullets: [
        'Dataset-model linkage, run IDs, parameter snapshots',
        'Exportable experiment manifests for peer review',
      ],
    },
  ];

  // Impact cards
  const impact = [
    {
      title: 'Daily Standups, Nightly Skies',
      text:
        'We run agile sprints tailored to scientific milestones—each iteration ends with validation on benchmark light curves.',
    },
    {
      title: 'Open-by-Default',
      text:
        'We document everything: data prep steps, model configs, and evaluation scripts for reproducibility.',
    },
    {
      title: 'Scientist Feedback Loop',
      text:
        'We scheduled checkpoints with domain peers at VNU-HCM to calibrate UI metaphors and vet model assumptions.',
    },
    {
      title: 'Beyond the Hackathon',
      text:
        'We plan to release a public demo and a paper-style tech note with dataset/model lineage diagrams for community use.',
    },
  ];

  // Stats row
  const stats = [
    { label: 'Datasets Integrated', value: 'Kepler, K2, TESS' },
    { label: 'Reproducible Runs', value: '100% with manifest export' },
    { label: 'Model Accuracy', value: 'Target ≥ 95% on benchmark splits' },
    { label: 'Latency', value: '<200 ms in visual lab (median)' },
    { label: 'Onboarding', value: '<3 minutes to first visualization' },
  ];

  return (
    <PageContainer title="OuterHomes — Introduction" description="Where data finds new worlds">
      <Box>
        {/* Hero Section */}
        <Section id="hero" gutter={false}>
          <Card elevation={9} sx={{ p: { xs: 3, md: 5 }, mb: 3 }}>
            <Stack spacing={3}>
              <Stack spacing={1}>
                <Typography variant="overline" color="secondary" fontWeight={700} sx={{ letterSpacing: 1.2 }}>
                  OuterHomes
                </Typography>
                <Typography variant="h3" fontWeight={900}>
                  OuterHomes — Where Data Finds New Worlds
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  A Computer Science team from University of Science, VNU-HCM,
                  building tools that turn starlight into discoveries.
                </Typography>
                <Typography color="text.secondary">
                  We bridge interactive visualization and adaptive AI to make exoplanet exploration intuitive,
                  transparent, and scalable.
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip color="primary" label="From: University of Science, VNU-HCM" />
                <Chip variant="outlined" color="secondary" label="Fields: AI/ML • Data Viz • Astronomy" />
                <Chip variant="outlined" label="Challenge: A World Away — Exoplanets with AI" />
              </Stack>

              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Button
                  component={Link}
                  href="/data/datasets"
                  variant="contained"
                  startIcon={<IconRocket />}
                >
                  Explore Our Solution
                </Button>
                <Button
                  component={Link}
                  href="#team"
                  variant="outlined"
                  startIcon={<IconUsersGroup />}
                >
                  Meet the Team
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Section>

        {/* Team Story */}
        <Section id="story" title="Our Story">
          <DashboardCard>
            <Typography>
              We’re six Computer Science students inspired by colleagues across physics and space science at VNU-HCM.
              At a university rooted in scientific rigor and interdisciplinary research, we found a shared curiosity:
              how can code augment human intuition in astronomy? OuterHomes began as a nightly conversation about light
              curves and ended as a commitment to build tools that scientists trust and the public loves to use. We
              believe that the “homes” we seek beyond Earth are revealed when we make data more human—visual, explorable,
              and transparent. That’s why we’re building a platform where orbits are visible, models are explainable,
              and discoveries are reproducible.
            </Typography>
          </DashboardCard>
        </Section>

        {/* Principles Grid */}
        <Section id="principles" title="What Guides Us">
          <Grid container spacing={3}>
            {principles.map((p, idx) => (
              <Grid key={idx} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card elevation={9} sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="h6" fontWeight={700}>
                        {p.title}
                      </Typography>
                      <Typography color="text.secondary">{p.text}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Section>

        {/* About Us (Two-Column Summary) */}
        <Section id="about">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <DashboardCard title="Mission">
                <Typography>
                  Empower exoplanet discovery through transparent visualization and adaptive AI—so insights travel
                  faster from telescope to understanding.
                </Typography>
              </DashboardCard>
              <Box sx={{ height: 16 }} />
              <DashboardCard title="Vision">
                <Typography>
                  A world where anyone can “read” starlight, and researchers can compose, compare, and reproduce models
                  as easily as they query data.
                </Typography>
              </DashboardCard>
            </Grid>
            <Grid size={{ xs: 12, lg: 5 }}>
              <DashboardCard title="What We’re Building">
                <Stack spacing={2}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Interactive Light Curve Lab
                      </Typography>
                      <Typography color="text.secondary">
                        Real-time orbit simulation + synchronized light curves. Query Kepler, K2, TESS; explore transit
                        geometry and brightness dips as they happen.
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Adaptive ML + Dataset Studio
                      </Typography>
                      <Typography color="text.secondary">
                        Combine datasets, track preprocessing, select/upload base models, and maintain lineage between
                        data and results for reproducibility.
                      </Typography>
                    </CardContent>
                  </Card>
                </Stack>
              </DashboardCard>
            </Grid>
          </Grid>
        </Section>

        {/* Challenge Fit */}
        <Section
          id="challenge"
          title="Why This Matters for Space Apps 2025"
          subtitle="Visual lab + model studio with versioned provenance"
        >
          <DashboardCard>
            <Typography>
              The challenge asks for an AI/ML model trained on NASA’s open datasets with a usable interface. OuterHomes
              merges both: a visual lab for understanding transit signals and a model studio that lets researchers
              integrate data, tweak hyperparameters, retrain, and inspect results—with versioned provenance that supports
              publication-grade workflows.
            </Typography>
          </DashboardCard>
        </Section>

        {/* Engagement and Commitment */}
        <Section id="engagement" title="How We Work">
          <Grid container spacing={3}>
            {impact.map((c, idx) => (
              <Grid key={idx} size={{ xs: 12, md: 6, lg: 3 }}>
                <Card elevation={9} sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="h6" fontWeight={700}>
                        {c.title}
                      </Typography>
                      <Typography color="text.secondary">{c.text}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Section>

        {/* Core Capabilities */}
        <Section id="capabilities" title="Core Capabilities">
          <Grid container spacing={3}>
            {[...features, ...features2].map((f, idx) => (
              <Grid key={idx} size={{ xs: 12, md: 6 }}>
                <Card elevation={9} sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {f.title}
                    </Typography>
                    <Stack spacing={1}>
                      {f.bullets.map((b, i) => (
                        <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                          <IconCircleCheck size={18} />
                          <Typography color="text.secondary">{b}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Section>

        {/* Value for Users */}
        <Section id="audience" title="Value for Users">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={9} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700}>
                    Researchers
                  </Typography>
                  <Typography color="text.secondary">
                    Faster iteration, explicit lineage, and reproducible pipelines reduce time from data ingestion to
                    publishable results.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={9} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700}>
                    Educators
                  </Typography>
                  <Typography color="text.secondary">
                    Visual-first tools to teach transit method, phase folding, and SNR intuitively.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={9} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700}>
                    Enthusiasts
                  </Typography>
                  <Typography color="text.secondary">
                    Explore real systems, see light dip as planets transit, grasp astronomy by interacting—not memorizing.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Section>

        {/* Team Members */}
        <Section id="team" title="Team Members">
          <Grid container spacing={3}>
            {team.map((m, idx) => (
              <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card elevation={9} sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        {/* <Avatar sx={{ width: 56, height: 56 }}>
                          {m.name.charAt(0)}
                        </Avatar> */}
                        <Box>
                          <Typography variant="h6" fontWeight={700}>
                            {m.name}
                          </Typography>
                          <Chip size="small" color="primary" label={m.role} />
                        </Box>
                      </Stack>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Focus
                        </Typography>
                        <Stack spacing={0.5}>
                          {m.focus.map((f, i) => (
                            <Typography key={i} color="text.secondary">
                              • {f}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        {m.fun}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Section>

        {/* Process Timeline (Milestone Strip) */}
        {/* <Section id="timeline" title="Process Timeline">
          <Grid container spacing={3}>
            {[
              ['Discovery', 'Requirements from Space Apps challenge; survey prior exoplanet ML literature.'],
              ['Data Foundation', 'Ingest Kepler/K2/TESS; define schema; normalize metadata; handle gaps and detrending.'],
              ['Visual Lab Prototype', 'Orbit and light curve sync; phase-folded view; baseline systems.'],
              ['ML Baseline', 'Candidate vs. false positive classifier; initial metrics; cross-mission validation.'],
              ['Provenance Layer', 'Run tracking, manifests, dataset-model linkage.'],
              ['UX Polish', 'Accessibility, keyboard navigation, performance, onboarding tutorial.'],
              ['Public Demo + Docs', 'Shareable demo; quickstart guide; reproducibility checklist.'],
            ].map(([title, text], idx) => (
              <Grid key={idx} size={{ xs: 12, md: 6, lg: 4 }}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {title}
                    </Typography>
                    <Typography color="text.secondary">{text}</Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Section> */}

        {/* Metrics & Success */}
        <Section id="metrics" title="Metrics & Success">
          <Grid container spacing={3}>
            {stats.map((s, idx) => (
              <Grid key={idx} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card elevation={9} sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      {s.label}
                    </Typography>
                    <Typography variant="h6" fontWeight={800}>
                      {s.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Section>

        {/* Ethics & Transparency */}
        <Section id="ethics" title="Responsible AI, Responsible Discovery">
          <DashboardCard>
            <Typography>
              We avoid overfitting with cross-mission validation, publish preprocessing steps, and surface model
              uncertainty alongside predictions. Every output links to its inputs.
            </Typography>
          </DashboardCard>
        </Section>

        {/* Microcopy Tips */}
        {/* <Section id="microcopy" title="Optional Microcopy for Visuals">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={9}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Tooltips
                  </Typography>
                  <Stack spacing={1} mt={1}>
                    <Tooltip title="Approximate planet-to-star area ratio; deeper dip suggests larger radius.">
                      <Chip label="Transit Depth" />
                    </Tooltip>
                    <Tooltip title="Light curve folded by orbital period to reveal periodic transits.">
                      <Chip label="Phase Fold" />
                    </Tooltip>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={9}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Guidance
                  </Typography>
                  <Stack spacing={1} mt={1}>
                    <Typography>Empty State: Try broadening search or loading sample exoplanets from Kepler favorites.</Typography>
                    <Typography>Onboarding: Drag the planet’s inclination to see how grazing transits change the light curve.</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Section> */}

        {/* Call to Action Banner */}
        <Section id="cta">
          <Card elevation={9} sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between">
              <Stack spacing={0.5}>
                <Typography variant="h5" fontWeight={800}>
                  Ready to explore?
                </Typography>
                <Typography color="text.secondary">
                  Try our interactive lab or run an experiment with your datasets and models.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Button
                  component={Link}
                  href="/data/datasets"
                  variant="contained"
                  startIcon={<IconStars />}
                >
                  Try the Light Curve Lab
                </Button>
                <Button
                  component={Link}
                  href="/data/models"
                  variant="outlined"
                  startIcon={<IconNotebook />}
                >
                  Run a Model Experiment
                </Button>
                <Button
                  component={Link}
                  href="/docs"
                  variant="text"
                  endIcon={<IconArrowRight />}
                >
                  Read the Technical Notes
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Section>

        {/* Short Team Manifesto */}
        <Section id="manifesto" title="Short Team Manifesto">
          <Card elevation={9}>
            <CardContent>
              <Typography variant="h6" fontStyle="italic">
                “We are OuterHomes. We code what we can measure, we show what we model, and we share what we learn—so the next discovery arrives sooner.”
              </Typography>
            </CardContent>
          </Card>
        </Section>

        {/* Footer Notes */}
        <Section id="footer-notes">
          <Card elevation={9}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip icon={<IconHeartHandshake />} label="NASA Space Apps 2025" />
                  <Chip icon={<IconUsersGroup />} label="University of Science, VNU-HCM" />
                  <Chip icon={<IconStars />} label="Open Source" />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  NASA datasets (Kepler, K2, TESS). For the love of science and the thrill of discovery.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Section>
      </Box>
    </PageContainer>
  );
}