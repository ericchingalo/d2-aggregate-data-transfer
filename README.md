# DHIS2 Aggregate Data Transfer

CLI tool for transferring aggregate dataset values between organisation units within a DHIS2 instance.

---

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [CLI Usage](#cli-usage)
  - [Examples](#examples)
- [Development & Contributing](#development--contributing)
  - [Project Structure](#project-structure)
  - [Development Commands](#development-commands)
  - [Packaging & Distribution](#packaging--distribution)
  - [Releases](#releases)
- [License](#license)

---

## Features

- **Organisation Unit Transfer**: Extract aggregate data values from a source organisation unit and push them to a target organisation unit.
- **Date Range Support**: Specify exact `--startDate` and `--endDate` boundaries for transfer.
- **Dataset Filtering**: Support single or multiple dataset IDs (comma-separated).
- **Attribute Option Combo**: Specify category option combos when needed for target dataset values.
- **Built-in Logging**: Detailed Winston logger outputting to console and persistent log files in `logs/`.

---

## Getting Started

### Prerequisites

- **Node.js**: >= 18.x
- **pnpm**: >= 9.x / 10.x (Recommended package manager)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/hisptz/d2-aggregate-data-transfer.git
cd d2-aggregate-data-transfer
pnpm install
```

### Environment Setup

Copy `.env.example` to create a local `.env` configuration file:

```bash
cp .env.example .env
```

Configure your DHIS2 credentials in `.env`:

```env
DHIS2_BASE_URL=https://your-dhis2-instance.org
DHIS2_USERNAME=your_username
DHIS2_PASSWORD=your_password
```

| Variable | Description | Required |
| --- | --- | --- |
| `DHIS2_BASE_URL` | Base URL of the target DHIS2 instance (without trailing slash or `/api`) | Yes |
| `DHIS2_USERNAME` | DHIS2 user account with API access and dataset read/write permissions | Yes |
| `DHIS2_PASSWORD` | DHIS2 user password | Yes |

---

### CLI Usage

Run transfers directly using `pnpm transfer` followed by required and optional options.

```bash
pnpm transfer [options]
```

#### Command Options

| Option | Required | Default | Description |
| --- | --- | --- | --- |
| `--startDate <YYYY-MM-DD>` | **Yes** | — | Start date for data extraction (ISO format) |
| `--from <source-ou-id>` | **Yes** | — | Source organisation unit ID |
| `--to <target-ou-id>` | **Yes** | — | Target organisation unit ID |
| `--dataSetIds <ds1,ds2>` | **Yes** | — | Comma-separated list of dataset IDs |
| `--endDate <YYYY-MM-DD>` | No | Current Date | End date for data extraction (ISO format) |
| `--attributeOptionCombo <id>` | No | — | Attribute option combo ID for target values |

---

### Examples

#### Basic Transfer
Transfer data for datasets `ds123456789` and `ds987654321` from source org unit `Dis12345678` to target org unit `Dis87654321` from January 1, 2026 to current date:

```bash
pnpm transfer \
  --startDate 2026-01-01 \
  --from Dis12345678 \
  --to Dis87654321 \
  --dataSetIds ds123456789,ds987654321
```

#### Transfer with End Date and Attribute Option Combo
Specify an end date and an attribute option combo ID:

```bash
pnpm transfer \
  --startDate 2026-01-01 \
  --endDate 2026-06-30 \
  --from Dis12345678 \
  --to Dis87654321 \
  --dataSetIds ds123456789 \
  --attributeOptionCombo aoc12345678
```

---

## Development & Contributing

### Project Structure

```
.
├── src/
│   ├── clients/         # Axios HTTP clients (DHIS2 API client)
│   ├── commands/        # Commander CLI commands and options definitions
│   ├── logging/         # Winston logger configuration
│   ├── services/        # Business logic for dataset data fetching & transferring
│   ├── types/           # TypeScript type declarations
│   └── index.ts         # Script entry point
├── app/                 # Output folder for compiled ESM bundle
├── bundle/              # Packaged ZIP release archives
├── logs/                # Runtime log output directory
├── package.json         # Scripts, dependencies, and metadata
├── tsup.config.ts       # Bundling and zip archive packaging configuration
├── vitest.config.ts     # Vitest testing configuration
└── tsconfig.json        # TypeScript configuration
```

### Development Commands

| Command | Action |
| --- | --- |
| `pnpm transfer` | Execute the CLI transfer command directly using `ts-node` |
| `pnpm type-check` | Run `tsc --noEmit` to verify type safety |
| `pnpm test` | Run test suite with Vitest |
| `pnpm build` | Bundle application into single ESM file using `tsup` and create zip package in `bundle/` |

---

### Packaging & Distribution

The project uses [`tsup`](https://tsup.egoist.dev/) to bundle the TypeScript code into a single, minified, executable Node.js file under `app/index.js`.

When running `pnpm build`, `tsup` automatically packages the bundled app alongside `.env.example` into a downloadable zip file inside the `bundle/` directory:

```bash
pnpm build
# Output zip: bundle/d2-aggregate-data-transfer-1.0.1.zip
```

---

### Releases

Automated semantic releases are configured using [`semantic-release`](https://github.com/semantic-release/semantic-release). On merge to main, standard commit messages (Conventional Commits) automatically trigger version bumps, changelog updates, GitHub release notes, and release artifacts.

---

## License

This project is licensed under the MIT License.
