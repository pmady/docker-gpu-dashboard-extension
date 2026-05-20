# Security Policy

## Reporting a Vulnerability

Don't open a public GitHub issue for security bugs. Report them privately:

1. [GitHub private vulnerability reporting](https://github.com/pmady/docker-gpu-dashboard-extension/security/advisories/new)
2. Or email **pavan4devops@gmail.com**

Include: what the bug is, how to reproduce it, and the impact. I'll acknowledge within 48 hours and coordinate a fix + disclosure timeline.

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest  | ✅        |

## Deployment Notes

- The extension backend runs inside Docker Desktop's VM — it has no direct host network access
- NVML access is read-only (metrics only, no device configuration)
- The Unix socket is only accessible within the extension VM
