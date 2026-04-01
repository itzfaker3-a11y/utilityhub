# UtilityHub

A comprehensive, open-source multi-tool utility platform with 49+ tools across 9 categories. Simple tools run entirely in your browser (no server needed); heavy-lifting tools run on a lightweight Express API server.

---

## Features

- **49+ tools** covering document processing, media conversion, web extraction, developer utilities, security, image analysis, and more
- **Client-side first** — most tools run in your browser with zero data sent to any server
- **Server-backed tools** — PDF rendering, video conversion, OCR, and AI transcription run via the included API server
- **Open source** — MIT licensed, no telemetry, no ads, no accounts required
- **Self-hostable** — run it locally or deploy to any Node.js host

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript, TailwindCSS, shadcn/ui |
| Backend API | Node.js, Express, TypeScript |
| Monorepo | pnpm workspaces |
| PDF rendering | Puppeteer (headless Chromium) |
| Image processing | sharp, Jimp |
| OCR | Tesseract.js |
| Video/Audio | ffmpeg (fluent-ffmpeg) |
| AI Transcription | OpenAI Whisper (gpt-4o-mini-transcribe) |
| Hashing | argon2, bcryptjs, native crypto |
| Schema / codegen | Zod, Orval (OpenAPI → React Query hooks) |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v9+
- [ffmpeg](https://ffmpeg.org/) installed on your system (for audio/video tools)
- An [OpenAI API key](https://platform.openai.com/) (only required for the Audio to Text tool)

### Installation

```bash
# Clone the repository
git clone https://github.com/itzfaker3-a11y/utilityhub.git
cd utilityhub

# Install all dependencies
pnpm install
```

### Environment Variables

Create a `.env` file in `artifacts/api-server/` (or export these in your shell):

```env
# Required only for Audio-to-Text transcription
OPENAI_API_KEY=sk-...

# Optional: override the port the API server listens on (default: 8080)
PORT=8080
```

### Running Locally

Open **two terminal windows**:

**Terminal 1 — API Server:**
```bash
pnpm --filter @workspace/api-server run dev
# Starts at http://localhost:8080
```

**Terminal 2 — Frontend:**
```bash
pnpm --filter @workspace/utility-hub run dev
# Starts at http://localhost:5173 (or the next available port)
```

Then open `http://localhost:5173` in your browser.

### Run Everything at Once

```bash
pnpm run dev
# Starts all workspace packages concurrently
```

---

## All Tools

### Document & Image Processing

| Tool | Description | Mode |
|---|---|---|
| Image Format Converter | Convert images between JPG, PNG, WebP, GIF, BMP, TIFF | Client |
| Images to PDF | Combine multiple images into a single PDF | Server |
| PDF to Images | Extract PDF pages as PNG/JPEG images (multi-page → ZIP) | Server |
| PDF Text Extractor | Extract plain text from PDF documents | Server |
| Image to Text (OCR) | Extract text from images using Tesseract.js OCR | Server |
| Image to Word (OCR) | Convert an image to a Microsoft Word (.docx) document | Server |
| Image to Excel (OCR) | Extract tabular data from images to Excel | Server |
| Image to CSV (OCR) | Extract tabular data from images to CSV | Server |
| SVG to PNG Converter | Convert SVG vector graphics to PNG at any resolution | Server |
| HEIC / HEIF Converter | Convert Apple HEIC/HEIF photos to JPG, PNG, or WebP | Server |
| Word to PDF | Convert DOCX Word documents to PDF | Server |

### Media & Audio Conversion

| Tool | Description | Mode |
|---|---|---|
| Audio to Text | Transcribe audio/video files using OpenAI Whisper | Server |
| Audio Converter | Convert between MP3, WAV, AAC, OGG, FLAC | Server |
| Video Converter | Convert MP4, MKV, WebM; extract audio tracks | Server |
| Video to GIF | Convert short video clips into animated GIFs | Server |

### Web & Data Extraction

| Tool | Description | Mode |
|---|---|---|
| URL to PDF | Capture a full webpage as a PDF document | Server |
| URL to Screenshot | Take full-page screenshots of any URL | Server |
| Favicon Grabber | Fetch and download favicon icons from any website | Server |
| EXIF Data Extractor | View hidden metadata embedded in photos | Server |
| YouTube Thumbnail | Download high-res thumbnails from YouTube videos | Client |
| Open Graph Preview | Preview how a URL looks when shared on social media | Server |

### Developer & Text Tools

| Tool | Description | Mode |
|---|---|---|
| Text Case Converter | Convert text between UPPER, lower, camelCase, snake_case, kebab-case, etc. | Client |
| Base64 Encoder/Decoder | Encode and decode text or files to Base64 | Client |
| SQL Formatter | Format and beautify SQL queries | Client |
| JSON / CSV Converter | Convert between JSON arrays and CSV tables | Client |
| JSON to Excel | Convert a JSON array to an Excel spreadsheet | Server |
| XML to JSON | Convert XML documents to JSON | Client |
| HTML to Markdown | Convert rich HTML into clean Markdown | Client |
| CSV to HTML Table | Convert CSV data into an HTML table | Client |

### Security & Hashing

| Tool | Description | Mode |
|---|---|---|
| Text Hasher | Generate MD5, SHA-1, SHA-256, SHA-512 hashes | Client |
| File Checksum | Calculate cryptographic checksums of files | Client |
| Bcrypt Generator | Generate and verify bcrypt password hashes | Server |
| Argon2 Generator | Generate Argon2id / Argon2i / Argon2d hashes | Server |
| HMAC Generator | Generate HMAC authentication codes (SHA-256/512) | Client |
| Password Generator | Generate secure random passwords and API tokens | Client |
| Password Strength | Analyze password strength and estimated crack time | Client |

### Image Hashing & Identification

| Tool | Description | Mode |
|---|---|---|
| Perceptual Image Hash | Generate aHash, pHash, dHash to identify similar images | Server |
| Error Level Analysis | Detect digital manipulation in JPEG images | Server |
| Duplicate Image Finder | Upload multiple images to find visually similar duplicates | Server |

### Smart Generators

| Tool | Description | Mode |
|---|---|---|
| Lorem Ipsum Generator | Generate placeholder text for designs and layouts | Client |
| QR Code Generator | Create custom QR codes for URLs, text, WiFi, vCards | Client |
| Barcode Generator | Generate EAN-13, UPC-A, Code128 barcodes | Client |
| UUID Generator | Generate bulk random v4 UUIDs/GUIDs | Client |
| Dummy Data Generator | Generate bulk fake data in JSON or CSV format | Client |

### Digital Asset Utilities

| Tool | Description | Mode |
|---|---|---|
| CSS Gradient Generator | Design linear and radial CSS gradients visually | Client |
| Aspect Ratio Calculator | Calculate dimensions based on standard aspect ratios | Client |
| SVG Optimizer | Minify and optimize SVG code for the web | Client |
| Lottie Previewer | Preview and test Lottie animation JSON files | Client |

### Productivity & Formatting

| Tool | Description | Mode |
|---|---|---|
| Markdown Editor | Live-preview Markdown editor with HTML export | Client |
| Word Counter | Count characters, words, sentences; analyze reading time | Client |
| Remove Duplicates | Remove duplicate lines from text lists | Client |

---

## Project Structure

```
utilityhub/
├── artifacts/
│   ├── api-server/          # Express API server (TypeScript, esbuild bundled)
│   │   └── src/
│   │       └── routes/tools/ # Tool route handlers
│   └── utility-hub/         # React + Vite frontend
│       └── src/
│           ├── pages/tools/  # One page per tool
│           ├── components/   # Shared UI components
│           └── lib/tools.ts  # Tool registry
├── lib/
│   ├── api-spec/            # OpenAPI 3.0 spec (single source of truth)
│   ├── api-zod/             # Generated Zod schemas + API client (Orval)
│   └── db/                  # Shared database utilities (Drizzle ORM)
└── pnpm-workspace.yaml
```

---

## API

The API server exposes a REST API documented in [`lib/api-spec/openapi.yaml`](lib/api-spec/openapi.yaml).

All tool endpoints are under `/api/tools/` and accept `multipart/form-data` for file uploads or `application/json` for text-based tools.

**Health check:**
```
GET /api/healthz
→ { "status": "ok" }
```

---

## Regenerating API Clients

After modifying `lib/api-spec/openapi.yaml`, regenerate the TypeScript client and Zod schemas:

```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## Building for Production

```bash
# Build the API server (outputs to artifacts/api-server/dist/)
pnpm --filter @workspace/api-server run build

# Build the frontend (static files in artifacts/utility-hub/dist/)
pnpm --filter @workspace/utility-hub run build
```

---

## Open Source Libraries Used

| Library | Purpose | License |
|---|---|---|
| [React](https://react.dev/) | UI framework | MIT |
| [Vite](https://vitejs.dev/) | Frontend bundler | MIT |
| [TailwindCSS](https://tailwindcss.com/) | Utility CSS | MIT |
| [shadcn/ui](https://ui.shadcn.com/) | Component library | MIT |
| [Express](https://expressjs.com/) | API server framework | MIT |
| [sharp](https://sharp.pixelplumbing.com/) | High-performance image processing | Apache-2.0 |
| [Puppeteer](https://pptr.dev/) | Headless browser (PDF, screenshots) | Apache-2.0 |
| [Tesseract.js](https://tesseract.projectnaptha.com/) | OCR engine | Apache-2.0 |
| [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) | Audio/video processing | MIT |
| [pdf-lib](https://pdf-lib.js.org/) | PDF creation | MIT |
| [pdf-parse](https://gitlab.com/autokent/pdf-parse) | PDF text extraction | MIT |
| [mammoth](https://github.com/mwilliamson/mammoth.js) | DOCX to HTML | BSD-2-Clause |
| [heic-convert](https://github.com/catdad-experiments/heic-convert) | HEIC/HEIF conversion | MIT |
| [archiver](https://github.com/archiverjs/node-archiver) | ZIP file creation | MIT |
| [argon2](https://github.com/ranisalt/node-argon2) | Argon2 password hashing | MIT |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Bcrypt password hashing | MIT |
| [xlsx](https://sheetjs.com/) | Excel file generation | Apache-2.0 |
| [exifr](https://github.com/MikeKovarik/exifr) | EXIF metadata extraction | MIT |
| [cheerio](https://cheerio.js.org/) | HTML parsing | MIT |
| [openai](https://github.com/openai/openai-node) | OpenAI Whisper API | Apache-2.0 |
| [Zod](https://zod.dev/) | Runtime schema validation | MIT |
| [TanStack Query](https://tanstack.com/query) | Data fetching / caching | MIT |
| [Orval](https://orval.dev/) | OpenAPI → TypeScript codegen | MIT |
| [wouter](https://github.com/molefrog/wouter) | Client-side routing | ISC |
| [pnpm](https://pnpm.io/) | Fast, disk-efficient package manager | MIT |

---

## License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE) for details.

---

## Contributing

Contributions are welcome! To add a new tool:

1. Add the tool definition to `artifacts/utility-hub/src/lib/tools.ts`
2. Create the page at `artifacts/utility-hub/src/pages/tools/<tool-id>.tsx`
3. Register the route in `artifacts/utility-hub/src/App.tsx`
4. If server-side: add the endpoint to `lib/api-spec/openapi.yaml`, run codegen, and implement the handler in `artifacts/api-server/src/routes/tools/`

Please open an issue first to discuss new tool ideas.
