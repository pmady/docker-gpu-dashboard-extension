# Contributing

Thanks for your interest. Here's how to get started.

## Development Setup

### Prerequisites

- Docker Desktop 4.30+
- Go 1.22+
- Node.js 18+
- (Optional) NVIDIA GPU + drivers for real metrics

### Run locally with mock data

```bash
make ui-deps
make backend-mock   # starts Go backend with fake GPU data
cd ui && npm run dev  # starts Vite dev server on :5173
```

### Build the extension image

```bash
make build
make install
```

## Submitting Changes

1. Fork the repo
2. Create a branch: `git checkout -b feat/my-change`
3. Make your changes and test locally
4. Commit with sign-off: `git commit -s -m "feat: my change"`
5. Push and open a PR

## Code Style

- **Go backend:** `gofmt`, no CGO in the mock path
- **React frontend:** standard JSX conventions, no TypeScript required
- Sign off all commits (DCO)

## Reporting Issues

Use GitHub Issues. Include:
- Docker Desktop version
- GPU model and driver version (if applicable)
- Screenshots of the issue
- Browser console errors (if UI-related)
