'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Paper,
  Avatar,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  IconRocket,
  IconUsersGroup,
  IconStars,
  IconHeartHandshake,
  IconNotebook,
  IconArrowRight,
  IconCircleCheck,
  IconTimeline,
  IconChartDots,
  IconDeviceAnalytics,
  IconSparkles,
} from '@tabler/icons-react';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

/* Decorative: Animated starfield canvas for the hero */
function Starfield({
  density = 0.00025,
  speed = 0.02,
  twinkle = true,
}: {
  density?: number;
  speed?: number;
  twinkle?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const starsRef = useRef<{ x: number; y: number; z: number; a: number }[]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h };
      // regenerate stars on resize
      const count = Math.floor(w * h * density);
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.5 + 0.5,
        a: Math.random(),
      }));
    };

    const draw = () => {
      const { w, h } = sizeRef.current;
      if (w === 0 || h === 0) return;
      ctx.clearRect(0, 0, w, h);

      // background subtle gradient overlay (keeps dark theme aesthetic)
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, 'rgba(24,24,48,0.9)');
      g.addColorStop(1, 'rgba(12,12,24,0.9)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // draw stars
      for (const s of starsRef.current) {
        s.y += s.z * speed;
        if (s.y > h) {
          s.y = 0;
          s.x = Math.random() * w;
          s.z = Math.random() * 0.5 + 0.5;
        }
        if (twinkle) {
          s.a += (Math.random() - 0.5) * 0.02;
          if (s.a < 0.2) s.a = 0.2;
          if (s.a > 1) s.a = 1;
        }
        const r = s.z * 1.2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${0.4 * s.a})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [density, speed, twinkle]);

  return (
    <Box
      component="canvas"
      ref={ref}
      sx={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        borderRadius: 3,
        opacity: 0.9,
      }}
    />
  );
}

/* Animated number for stats */
function CountUp({ to, duration = 1200, suffix = '', prefix = '' }: { to: number; duration?: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const loop = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <>{prefix}{val}{suffix}</>;
}

/* Section wrapper with optional heading */
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
              <Typography variant="h4" fontWeight={900}>
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
  const team = [
    {
      name: 'Nguyen Phan Hoang Bach',
      role: 'ML Lead',
      focus: ['Model selection', 'Training pipeline', 'Evaluation protocol'],
      fun: '“Chasing periodicity in noise since sophomore year.”',
    },
    {
      name: 'Nguyen Nam Quan',
      role: 'Data Engineer',
      focus: ['ETL from Kepler/K2/TESS', 'Preprocessing', 'Feature stores'],
      fun: '“Make the data sing before the model dances.”',
    },
    {
      name: 'Nguyen Thanh Hai',
      role: 'Visualization Lead',
      focus: ['Orbit rendering', 'Linked light curve interactions', 'Visual patterns'],
      fun: '“If you can see it, you can question it.”',
    },
    {
      name: 'Dinh Ho Gia Huy',
      role: 'UX Engineer',
      focus: ['Interaction design', 'Accessibility', 'Responsive patterns'],
      fun: '“Interfaces that teach while you explore.”',
    },
    {
      name: 'Nguyen Le Thinh Phuc',
      role: 'Infra/DevOps',
      focus: ['CI/CD', 'Experiment tracking', 'Scalable storage'],
      fun: '“Pipelines that don’t wake you at 3 a.m.”',
    },
    {
      name: 'Nguyen Ngoc Lam Huy',
      role: 'Product/Research',
      focus: ['Domain alignment', 'Documentation', 'Community outreach'],
      fun: '“Turning curiosity into roadmaps.”',
    },
  ];

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

  const stats = [
    { label: 'Datasets Integrated', value: 'Kepler, K2, TESS', type: 'text' as const },
    { label: 'Reproducible Runs', value: 100, suffix: '%', type: 'num' as const },
    { label: 'Model Accuracy', value: 95, prefix: '≥ ', suffix: '%', type: 'num' as const },
    { label: 'Latency', value: 200, suffix: ' ms', prefix: '<', type: 'num' as const },
    { label: 'Onboarding', value: 3, suffix: ' min', prefix: '<', type: 'num' as const },
  ];

  return (
    <PageContainer title="OuterHomes — Introduction" description="Where data finds new worlds">
      <Box>
        {/* HERO */}
        <Box
          sx={{
            position: 'relative',
            mb: 4,
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'background.default',
            minHeight: { xs: 380, md: 460 },
            px: { xs: 2.5, md: 4 },
            py: { xs: 4, md: 6 },
            // soft glow edges
            boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset, 0 30px 80px rgba(0,0,0,0.45)',
          }}
        >
          <Starfield />
          {/* gradient overlay + orbit accent */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(1200px 600px at 20% 10%, rgba(63,81,181,0.25), transparent 60%), radial-gradient(900px 500px at 85% 40%, rgba(0,188,212,0.18), transparent 60%)',
              pointerEvents: 'none',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              right: -120,
              top: -80,
              width: 500,
              height: 500,
              borderRadius: '50%',
              border: '1px dashed rgba(255,255,255,0.08)',
              filter: 'blur(0.2px)',
              pointerEvents: 'none',
            }}
          />
          <Stack spacing={3} position="relative">
            <Stack spacing={1}>
              <Typography variant="overline" color="secondary" fontWeight={800} sx={{ letterSpacing: 1.4 }}>
                OuterHomes
              </Typography>
              <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1.05 }}>
                Where Data Finds New Worlds
              </Typography>
              <Typography variant="h6" color="text.secondary">
                A Computer Science team from University of Science, VNU-HCM, building tools that turn starlight into discoveries.
              </Typography>
              <Typography color="text.secondary">
                We bridge interactive visualization and adaptive AI to make exoplanet exploration intuitive, transparent, and scalable.
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip sx={chipFx.solid} color="primary" label="From: University of Science, VNU-HCM" />
              <Chip sx={chipFx.outline} variant="outlined" color="secondary" label="Fields: AI/ML • Data Viz • Astronomy" />
              <Chip sx={chipFx.outline} variant="outlined" icon={<IconSparkles size={16} />} label="Challenge: A World Away — Exoplanets with AI" />
            </Stack>

            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button component={Link} href="/data/datasets" variant="contained" startIcon={<IconRocket />}>
                Explore Our Solution
              </Button>
              <Button component={Link} href="#team" variant="outlined" startIcon={<IconUsersGroup />}>
                Meet the Team
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* STORY */}
        <Section id="story" title="Our Story">
          <Card elevation={9} sx={glassCard}>
            <CardContent>
              <Typography>
                We’re six Computer Science students inspired by colleagues across physics and space science at VNU-HCM.
                At a university rooted in scientific rigor and interdisciplinary research, we found a shared curiosity:
                how can code augment human intuition in astronomy? OuterHomes began as a nightly conversation about light
                curves and ended as a commitment to build tools that scientists trust and the public loves to use. We
                believe that the “homes” we seek beyond Earth are revealed when we make data more human—visual, explorable,
                and transparent. That’s why we’re building a platform where orbits are visible, models are explainable,
                and discoveries are reproducible.
              </Typography>
            </CardContent>
          </Card>
        </Section>

        {/* PRINCIPLES */}
        <Section id="principles" title="What Guides Us">
          <Grid container spacing={3}>
            {principles.map((p, idx) => (
              <Grid key={idx} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card elevation={0} sx={fxCard}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="h6" fontWeight={800}>
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

        {/* ABOUT + WHAT WE’RE BUILDING */}
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
                  <Card variant="outlined" sx={pillCard}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={800}>
                        Interactive Light Curve Lab
                      </Typography>
                      <Typography color="text.secondary">
                        Real-time orbit simulation + synchronized light curves. Query Kepler, K2, TESS; explore transit
                        geometry and brightness dips as they happen.
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card variant="outlined" sx={pillCard}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={800}>
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

        {/* CHALLENGE */}
        <Section
          id="challenge"
          title="Why This Matters for Space Apps 2025"
          subtitle="Visual lab + model studio with versioned provenance"
        >
          <Card elevation={9} sx={glassCard}>
            <CardContent>
              <Typography>
                The challenge asks for an AI/ML model trained on NASA’s open datasets with a usable interface. OuterHomes
                merges both: a visual lab for understanding transit signals and a model studio that lets researchers
                integrate data, tweak hyperparameters, retrain, and inspect results—with versioned provenance that supports
                publication-grade workflows.
              </Typography>
            </CardContent>
          </Card>
        </Section>

        {/* IMPACT */}
        <Section id="engagement" title="How We Work">
          <Grid container spacing={3}>
            {impact.map((c, idx) => (
              <Grid key={idx} size={{ xs: 12, md: 6, lg: 3 }}>
                <Card elevation={0} sx={fxCard}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="h6" fontWeight={800}>
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

        {/* FEATURES */}
        <Section id="capabilities" title="Core Capabilities">
          <Grid container spacing={3}>
            {features.map((f, idx) => (
              <Grid key={idx} size={{ xs: 12, md: 6 }}>
                <Card elevation={0} sx={fxCard}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={900} gutterBottom>
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

        {/* AUDIENCE */}
        <Section id="audience" title="Value for Users">
          <Grid container spacing={3}>
            {[
              ['Researchers', 'Faster iteration, explicit lineage, and reproducible pipelines reduce time from data ingestion to publishable results.'],
              ['Educators', 'Visual-first tools to teach transit method, phase folding, and SNR intuitively.'],
              ['Enthusiasts', 'Explore real systems, see light dip as planets transit, grasp astronomy by interacting—not memorizing.'],
            ].map(([title, text], i) => (
              <Grid key={i} size={{ xs: 12, md: 4 }}>
                <Card elevation={0} sx={fxCard}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={800}>
                      {title}
                    </Typography>
                    <Typography color="text.secondary">{text}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Section>

        {/* TEAM */}
        <Section id="team" title="Team Members">
          <Grid container spacing={3}>
            {team.map((m, idx) => (
              <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card elevation={0} sx={fxCard}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={gradientAvatar}>{m.name.split(' ').map(s => s[0]).slice(0,2).join('')}</Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={900}>
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

        {/* TIMELINE */}
        <Section id="timeline" title="Process Timeline">
          <Grid container spacing={3}>
            {[
              { t: 'Discovery', d: 'Requirements from Space Apps challenge; survey prior exoplanet ML literature.', icon: <IconTimeline /> },
              { t: 'Data Foundation', d: 'Ingest Kepler/K2/TESS; define schema; normalize metadata; handle gaps and detrending.', icon: <IconDeviceAnalytics /> },
              { t: 'Visual Lab Prototype', d: 'Orbit and light curve sync; phase-folded view; baseline systems.', icon: <IconStars /> },
              { t: 'ML Baseline', d: 'Candidate vs. false positive classifier; initial metrics; cross-mission validation.', icon: <IconChartDots /> },
              { t: 'Provenance Layer', d: 'Run tracking, manifests, dataset-model linkage.', icon: <IconNotebook /> },
              { t: 'UX Polish', d: 'Accessibility, keyboard navigation, performance, onboarding tutorial.', icon: <IconSparkles /> },
              { t: 'Public Demo + Docs', d: 'Shareable demo; quickstart guide; reproducibility checklist.', icon: <IconHeartHandshake /> },
            ].map((it, idx) => (
              <Grid key={idx} size={{ xs: 12, md: 6, lg: 4 }}>
                <Paper variant="outlined" sx={timelineCard}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={timelineIcon}>{it.icon}</Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={900}>{it.t}</Typography>
                      <Typography color="text.secondary">{it.d}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Section>

        {/* METRICS */}
        <Section id="metrics" title="Metrics & Success">
          <Grid container spacing={3}>
            {stats.map((s, idx) => (
              <Grid key={idx} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card elevation={0} sx={metricCard}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {s.label}
                    </Typography>
                    {s.type === 'num' ? (
                      <Typography variant="h5" fontWeight={900}>
                        <CountUp to={s.value as number} prefix={(s as any).prefix || ''} suffix={(s as any).suffix || ''} />
                      </Typography>
                    ) : (
                      <Typography variant="h6" fontWeight={800}>
                        {s.value as string}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Section>

        {/* ETHICS */}
        <Section id="ethics" title="Responsible AI, Responsible Discovery">
          <Card elevation={9} sx={glassCard}>
            <CardContent>
              <Typography>
                We avoid overfitting with cross-mission validation, publish preprocessing steps, and surface model
                uncertainty alongside predictions. Every output links to its inputs.
              </Typography>
            </CardContent>
          </Card>
        </Section>

        {/* CTA */}
        <Section id="cta">
          <Card elevation={0} sx={ctaCard}>
            <CardContent>
              <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between">
                <Stack spacing={0.5}>
                  <Typography variant="h5" fontWeight={900}>
                    Ready to explore?
                  </Typography>
                  <Typography color="text.secondary">
                    Try our interactive lab or run an experiment with your datasets and models.
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Button component={Link} href="/data/datasets" variant="contained" startIcon={<IconStars />}>
                    Try the Light Curve Lab
                  </Button>
                  <Button component={Link} href="/data/models" variant="outlined" startIcon={<IconNotebook />}>
                    Run a Model Experiment
                  </Button>
                  <Button component={Link} href="/docs" variant="text" endIcon={<IconArrowRight />}>
                    Read the Technical Notes
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Section>

        {/* MANIFESTO */}
        <Section id="manifesto" title="Short Team Manifesto">
          <Card elevation={9} sx={glassCard}>
            <CardContent>
              <Typography variant="h6" fontStyle="italic">
                “We are OuterHomes. We code what we can measure, we show what we model, and we share what we learn—so the next discovery arrives sooner.”
              </Typography>
            </CardContent>
          </Card>
        </Section>

        {/* FOOTER NOTES */}
        <Section id="footer-notes">
          <Card elevation={0} sx={fxCard}>
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

/* Styles */

const chipFx = {
  solid: {
    fontWeight: 700,
  },
  outline: {
    borderColor: 'rgba(255,255,255,0.2)',
    '&:hover': { borderColor: 'rgba(255,255,255,0.4)' },
  },
};

const glassCard = {
  backdropFilter: 'blur(6px)',
  background:
    'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
  border: '1px solid rgba(255,255,255,0.08)',
};

const fxCard = {
  position: 'relative',
  borderRadius: 2,
  border: '1px solid rgba(255,255,255,0.08)',
  background:
    'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
  transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
    borderColor: 'rgba(127, 179, 255, 0.35)',
  },
};

const pillCard = {
  borderRadius: 4,
  borderColor: 'rgba(127, 179, 255, 0.25)',
};

const gradientAvatar = {
  width: 56,
  height: 56,
  fontWeight: 900,
  color: '#fff',
  background:
    'linear-gradient(135deg, #3f51b5 0%, #00bcd4 100%)',
  boxShadow: '0 6px 16px rgba(63, 81, 181, 0.35)',
};

const timelineCard = {
  p: 2,
  height: '100%',
  borderRadius: 2,
  borderColor: 'rgba(127,179,255,0.25)',
  background:
    'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
};

const timelineIcon = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  color: '#fff',
  background: 'linear-gradient(135deg, #3f51b5 0%, #00bcd4 100%)',
  boxShadow: '0 6px 16px rgba(0, 188, 212, 0.35)',
};

const metricCard = {
  borderRadius: 2,
  border: '1px solid rgba(255,255,255,0.08)',
  background:
    'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
};

/* FIX: CTA card style */
const ctaCard = {
  borderRadius: 3,
  border: '1px solid rgba(127,179,255,0.25)',
  background:
    'linear-gradient(180deg, rgba(127,179,255,0.06) 0%, rgba(0,0,0,0.02) 100%)',
  boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
};