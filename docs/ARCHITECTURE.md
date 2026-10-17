# SentinelForge Architecture

## System Overview

**Type:** Monolithic Next.js application  
**Stack:** TypeScript, Next.js 16, React 19, SQLite, Tailwind CSS  
**Deployment:** Local development server

## Architecture Principles

1. **Zero-cost operation** - No paid services or APIs
2. **Local-first** - Runs entirely on localhost
3. **Defensive security** - Authorized targets only
4. **Modular scanners** - Pluggable tool adapters
5. **Honest reporting** - Real data, no fabrication

## Components

### Frontend (Next.js App Router)

```
app/
├── page.tsx              # Dashboard
├── projects/page.tsx     # Project list
├── scanners/page.tsx     # Scanner status
└── api/                  # Backend routes
```

**Tech:**
- Server components for data fetching
- Client components for interactivity
- Tailwind for styling
- Dark-first UI

### API Layer

```
app/api/
├── health/route.ts       # System health
├── projects/route.ts     # CRUD operations
├── scans/route.ts        # Scan execution
├── scans/[id]/route.ts   # Scan detail
├── findings/route.ts     # Finding list
└── scanners/route.ts     # Tool detection
```

**Responsibilities:**
- Request validation
- Database operations
- Scanner orchestration
- Error handling

### Data Layer

**Database:** SQLite via better-sqlite3

**Schema:**
- `projects` - Registered applications
- `scans` - Scan executions
- `findings` - Security findings

**Design:**
- Normalized relations
- Cascading deletes
- Indexed queries
- Unix timestamps

### Scanner Engine

**Interface:**
```typescript
async function runScan(
  scanId: string,
  scanner: string,
  project: Project
): Promise<void>
```

**Adapters:**
- `runNpmAudit()` - Dependency scanning
- `runSemgrep()` - Static analysis (when available)

**Safety:**
- `execFileSync` prevents injection
- Hardcoded command names
- No shell interpolation
- Timeout enforcement
- Error isolation

### Security Controls

**Target Authorization:**
- Projects registered before scanning
- Explicit repo paths
- No arbitrary URLs

**Process Safety:**
- Child process isolation
- Argument arrays (not strings)
- Timeouts on all executions
- No privileged containers

**Input Validation:**
- Server-side checks
- SQL parameterization
- No eval or dynamic requires

**Output Sanitization:**
- Safe HTML rendering
- No raw process output to client

## Data Flow

### Scan Execution

```
1. POST /api/scans { projectId, scanner }
2. Validate project exists
3. Create scan record (status: running)
4. Return scanId (202 Accepted)
5. Async: Execute scanner
6. Parse output
7. Store findings
8. Update scan (status: completed)
```

### Finding Storage

```
1. Scanner returns raw results
2. Normalize to common schema
3. Generate finding fingerprint
4. Check for duplicates
5. Insert with timestamp
6. Link to scan and project
```

## Deployment

**Local Development:**
```bash
npm run dev  # http://localhost:3000
```

**Production (Future):**
- Docker container
- Volume-mounted database
- Environment-based config
- Reverse proxy for HTTPS

## Scalability

**Current:** Single-process, synchronous scans  
**Future:** Background job queue, concurrent scanning

## Extension Points

1. **New Scanners**: Implement adapter in `runScan()`
2. **New Findings**: Extend finding schema
3. **AI Integration**: Optional remediation service
4. **Reports**: Export logic in `/api/reports`

## Technology Decisions

**Why SQLite?**
- Zero setup
- File-based (portable)
- Sufficient for MVP
- Upgrade path to Postgres

**Why better-sqlite3?**
- Synchronous API (simpler)
- Native performance
- No Prisma install issues

**Why Next.js App Router?**
- Server components reduce client JS
- Collocated API routes
- Type-safe data fetching

**Why execFileSync?**
- Prevents command injection
- Synchronous error handling
- Timeout support

## Known Limitations

- Single-user (no auth)
- Synchronous scans (blocks)
- No scan cancellation
- No real-time progress
- Local filesystem only
