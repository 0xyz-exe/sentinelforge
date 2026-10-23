# SentinelForge

Open-Source Application Security Lab

Repository: https://github.com/0xyz-exe/sentinelforge

## Screenshots

### Security Metrics Dashboard
![Security dashboard](docs/screenshots/01_dashboard.png)

### Finding Management & Triage
![Findings](docs/screenshots/02_findings.png)

### Project Scanner Configuration
![Scanner configuration](docs/screenshots/03_project_scanners.png)

### Security Scan Reports & Remediation
![Scan reports](docs/screenshots/04_reports.png)

## Overview

SentinelForge helps developers assess application security, reproduce vulnerabilities in isolated labs, understand findings, verify fixes, and generate actionable reports.

## Features

- **Project Management**: Register applications and repositories for authorized security assessment
- **Static Analysis**: Code security scanning (Semgrep integration when available)
- **Dependency Scanning**: npm audit for JavaScript/Node.js vulnerabilities
- **Finding Management**: Track, triage, and remediate security findings
- **Scanner Status**: Real-time availability checks for security tools
- **Dashboard**: Security metrics and quick actions

## Prerequisites

- Node.js 26+ 
- npm 11+
- Python 3.13+ (optional, for Semgrep)

## Installation

```bash
npm install
```

## Configuration

`.env` file already configured with defaults:

```bash
DATABASE_URL="file:./data/sentinelforge.db"
```

## Running

```bash
npm run dev
```

Access: http://localhost:3000

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/scanners` - Scanner availability
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `POST /api/scans` - Start scan
- `GET /api/scans/:id` - Get scan results
- `GET /api/findings` - List findings

## Security Scanners

### npm audit (Built-in)
No installation required

### Semgrep (Optional)
```bash
pip install semgrep
```

## Usage

1. Navigate to Projects → New Project
2. Add repository path or base URL
3. Select scanner and start scan
4. Review findings by severity

## Security

- Scans run against explicitly registered targets only
- No arbitrary URL scanning
- Command injection prevention via `execFileSync`
- Input validation on all API routes
- SQLite with parameterized queries

See [docs/SECURITY.md](docs/SECURITY.md)

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Security](docs/SECURITY.md)

## Development Status

**MVP - Core functionality implemented:**
- ✅ Database schema
- ✅ Project management
- ✅ Scanner detection
- ✅ Scan orchestration
- ✅ npm audit integration
- ✅ Finding storage
- ✅ Dashboard UI
- ⏳ Semgrep (pending install)
- ⏳ Finding detail view
- ⏳ Learning lab
- ⏳ DAST
- ⏳ Reports

## License

MIT
