# OuterHomes — A World Away, Closer to Home

Bringing distant worlds a little closer to home.  
We are six Computer Science students from the University of Science, VNU-HCM, building open, intuitive tools that turn exoplanet data into discovery.

---

## Overview

OuterHomes is our submission for the 2025 NASA Space Apps Challenge: “A World Away: Hunting for Exoplanets with AI.”

Our solution unites:
1) An interactive light-curve visualization platform that animates multi-planet orbits in real time and links dips in brightness to orbital events, with searchable access to Kepler, K2, and TESS exoplanets.
2) An adaptive machine learning and dataset management system that lets researchers mix datasets, bring or select base models, track dataset–model lineage, and reproduce results with confidence.

Together, these systems bridge exploration and analysis—helping both newcomers and scientists understand, simulate, and identify exoplanets at scale.

---

## Why “OuterHomes”?

Home is where things make sense. We can’t move the stars closer, but we can bring understanding closer. OuterHomes turns distant data into familiar patterns—so anyone can feel at home reading the sky.

---

## Key Features

- Real-time orbit and transit simulations with synchronized light curves
- Search, filter, and visualize exoplanets from Kepler, K2, and TESS
- Upload and combine datasets; manage data–model relationships
- Bring-your-own-model (BYOM) or pick curated baselines
- Transparent lineage: which datasets trained which models, when, and how
- Exportable reports, metrics, and model cards for reproducibility
- Web-first, accessible UI for learners and researchers

---

## Tech Stack

- Frontend: Next.js, React, TypeScript, MUI, WebGL/Canvas, D3
- ML/Backend: Python, PyTorch/TF, scikit-learn, XGBoost
- Data Ops: Parquet/Arrow, DVC/MLflow for versioning and experiments
- Infra: Docker; GPU-ready training; REST/Graph endpoints

Note: This repository may include a Next.js admin template (Modernize) as a scaffold for dashboards and management pages.

---

## Getting Started

Prerequisites:
- Node.js LTS
- npm or pnpm
- Python 3.10+ (for ML services)
- Docker (optional, for containerized runs)

1) Clone
```bash
git clone <repo-url>
cd package
```

2) Install frontend
```bash
npm install
```

3) Run frontend
```bash
npm run dev
```

---

## Project Structure (suggested)

- apps/web — Next.js app (visualization, UI, dashboards)
- services/ml — Model training, inference API, dataset manager
- data/ — Sample datasets, schema, and preprocessing scripts
- docs/ — Model cards, architecture diagrams, experiment logs
- scripts/ — Dev tooling, data ingestion, CI helpers

---

## User Journeys

- Explorers (Novices)
  - Visualize orbits; see how transits form light curves
  - Compare planets by radius, period, and duration
  - Save and share interactive scenes

- Researchers
  - Upload light curves and metadata
  - Train or fine-tune models; tweak hyperparameters
  - Audit lineage; reproduce runs with versioned configs

---

## Data & Resources

- NASA Missions: Kepler, K2, TESS (confirmed, candidates, false positives)
- Methods: Detrending, normalization, gap handling, augmentation
- Models: 1D CNNs/transformers for sequences; tree ensembles for tabular
- Validation: Time-aware splits, mission-stratified folds, calibration checks
- Explainability: Saliency on temporal windows; feature attribution for tabular features

---

## Contributing

We welcome issues, discussions, and PRs.  
Please:
- Open an issue describing the feature/bug
- Link datasets and note licenses/provenance
- Include reproducible steps, configs, and environment details

---

## License

Unless specified otherwise, this project is released under the MIT License.  
Check individual folders for additional licenses where applicable.

---

## Acknowledgments

- University of Science, VNU-HCM—our home for interdisciplinary inspiration
- NASA Space Apps Challenge, Earth Science Division
- Kepler, K2, TESS teams and the open data community

---

## Contact

Nguyen Ngoc Lam Huy  
nnlhuy23@apcs.fitus.edu.vn

Connect with #SpaceApps