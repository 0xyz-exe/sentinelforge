# SentinelForge Security

## Threat Model

**In Scope:**
- Command injection
- SQL injection  
- Path traversal
- Arbitrary code execution
- Secret exposure
- Uncontrolled resource consumption

**Out of Scope (Local Deployment):**
- Network attacks (runs on localhost)
- Multi-tenant isolation (single user)
- DDoS (not public-facing)

## Security Controls

### Input Validation

**API Layer:**
- All routes validate required fields
- Type checking via TypeScript
- Server-side enforcement (no client trust)

**Database:**
- Parameterized queries only
- No string concatenation in SQL
- SQLite injection protection

### Command Execution Safety

**Before:**
```typescript
// UNSAFE
execSync(`semgrep ${userInput}`)
```

**After:**
```typescript
// SAFE - no shell, argument array
execFileSync('semgrep', ['--config=auto', repoPath], { timeout: 120000 })
```

**Protections:**
- Hardcoded command names
- Argument arrays (not shell strings)
- No user input in command construction
- Timeout enforcement
- Error boundary isolation

### Target Authorization

**Controls:**
- Projects must be registered before scanning
- Explicit allowlist (no wildcard domains)
- Server-side scope validation
- Reject unregistered targets

**Not Implemented (MVP):**
- Redirect validation
- SSRF protection for DAST
- Network-level isolation

### Secret Management

**Current:**
- `.env` for local config
- `.gitignore` includes `.env`
- No secrets in source

**Future:**
- Secret detection scanner (Gitleaks)
- Redaction in logs/reports
- Never transmit secrets to AI providers

### Output Sanitization

**Database → UI:**
- React escapes by default
- No `dangerouslySetInnerHTML`
- Safe rendering of evidence

**Logs:**
- No raw scanner output to client
- Error messages sanitized
- No stack traces in production

### Resource Limits

**Implemented:**
- Scanner timeouts (60-120s)
- JSON parsing size limits (implicit)

**Not Implemented:**
- CPU/memory limits
- Concurrent scan limits
- Rate limiting

## Vulnerability Response

**If scanner finds issue in SentinelForge itself:**
1. Create finding
2. Triage severity
3. Fix in dev
4. Rescan to verify
5. Document in changelog

**Disclosure:**
- Local tool (not public service)
- Issues tracked via GitHub
- Security.md for contact

## Audit Recommendations

**Before Production:**
1. Add authentication
2. Implement SSRF protection for DAST
3. Add scan cancellation
4. Resource limits (cgroups/ulimit)
5. Audit all `execFile` calls
6. Rate limiting
7. HTTPS enforcement
8. Security headers (CSP, HSTS)

## Secure Development Practices

**Code Review Checklist:**
- [ ] No `exec` or `execSync` (use `execFile`)
- [ ] No SQL string concatenation
- [ ] No arbitrary user paths
- [ ] Scanner output treated as untrusted
- [ ] Timeouts on all I/O
- [ ] Secrets not logged
- [ ] Error messages generic to client

## Known Issues

**P3 - Low:**
- No scan concurrency limit (local resource exhaustion)
- No authentication (designed for single local user)
- Process-level isolation only (no containers)

**Accepted Risks (MVP):**
- Local deployment assumes trusted user
- Filesystem access unrestricted
- No network sandboxing
