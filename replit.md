# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

### `artifacts/utility-hub` (`@workspace/utility-hub`)

UtilityHub — a comprehensive multi-tool utility platform with 48 tools across 9 categories. React + Vite SPA mounted at `/` (root preview path).

- Entry: `src/main.tsx` — React app entry
- App: `src/App.tsx` — Wouter router with all tool routes (specific routes MUST come before `/:category` wildcard route)
- Pages: `src/pages/tools/` — individual tool page components (one per tool)
- Shared: `src/components/layout.tsx` — sidebar layout with search, `src/components/file-upload-tool.tsx` — generic file upload component
- Tool data: `src/lib/tools.ts` — all tools and categories definitions
- Styles: `src/index.css` — Tailwind CSS + custom orange-red primary theme

**Tool Categories:**
1. Document & Image Processing (10 tools — server-side: convert-image, images-to-pdf, pdf-to-images, pdf-to-text, image-to-text, image-to-docx, image-to-xlsx, svg-to-png, heic-convert, image-to-csv)
2. Media & Audio Conversion (3 tools — server-side: convert-audio, convert-video, video-to-gif)
3. Web & Data Extraction (6 tools — server-side via Puppeteer: url-to-pdf, url-to-screenshot, favicon-grabber, exif-data, youtube-thumbnail, og-preview)
4. Security & Hashing (8 tools — hash-text/file-checksum/password-generator/password-strength client+server; bcrypt/argon2/hmac server-side)
5. Image Hashing & Identification (3 tools — server-side: image-hash, image-ela, duplicate-finder)
6. Smart Generators (5 tools — client-side: lorem-ipsum, qr-code, barcode, uuid-generator, dummy-data)
7. Digital Asset Utilities (5 tools — favicon-generator server-side; css-gradient/aspect-ratio/svg-optimizer/lottie-previewer client-side)
8. Developer & Text Tools (8 tools — client-side + server: text-case, base64, sql-formatter, json-csv, json-to-excel, xml-json, html-markdown, csv-to-html)
9. Productivity & Formatting (3 tools — all client-side: markdown-editor, word-counter, remove-duplicates)

**API Server routes for tools:** Mounted at `/api/tools/` in `artifacts/api-server/src/routes/tools/`:
- `image.ts` — image/PDF/OCR/DOCX/XLSX/SVG/HEIC/CSV/ICO tools (sharp, pdf-lib, tesseract.js, docx, xlsx, pdf-parse)
- `security.ts` — hash-text, file-checksum, bcrypt, argon2, hmac (bcryptjs, argon2, crypto)
- `media.ts` — audio/video/gif conversion (fluent-ffmpeg)
- `web.ts` — url-to-pdf, url-to-screenshot, favicon-grabber, youtube-thumbnail, og-preview (puppeteer); SSRF-protected via DNS-based IP validation blocking private ranges

**Security notes:**
- URL-processing endpoints (url-to-pdf, url-to-screenshot, og-preview) use `validateUrl()` with DNS lookup to block private CIDRs (127.x, 10.x, 172.16-31.x, 192.168.x, 169.254.x, ::1, fc00:, fe80:) and non-http(s) schemes
- Favicon ICO generator produces valid ICO binary (not PNG) with 16x16, 32x32, 48x48 sizes embedded

**Critical routing note:** In `App.tsx`, the CategoryPage route `/tools/:category` MUST appear AFTER all specific tool routes like `/tools/text-case`, otherwise Wouter's Switch matches the dynamic `:category` segment first and all tools show "Category not found".
