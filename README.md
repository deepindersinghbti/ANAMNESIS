

### Digital Crime-Scene Intelligence for Manipulated Media

> Don't just detect the fake. Trace its story.

## 🔎 About

Anamnesis is an investigator-assistance platform designed to help analyse suspicious media, identify related versions, understand how media changed, examine surrounding context, and organise findings into a structured forensic case.

## 🚀 Live Prototype

_Deployment pending._ The earlier hosted build predates the current
application and is not representative of it. See **[DEPLOY.md](DEPLOY.md)** to
stand up an instance; the URL will be published here once it is live.

To run it yourself in the meantime, see [Running It](#️-running-it) below.

## 🚨 Problem

Manipulated media can be cropped, compressed, screen-recorded, watermarked and re-uploaded multiple times.

By the time investigators receive a copy, the original may be unavailable and the different versions may appear unrelated.

Traditional tools often focus on:

**“Is this fake?”**

Anamnesis focuses on:

**“What happened to it?”**

## 🔒 The File Stays On Your Machine

The measurements that matter most run entirely in the browser.

SHA-256 hashing, EXIF extraction, Error Level Analysis, sensor-noise variance and Sobel edge detection are all computed locally on the file you drop in. No network call is involved in any of them, so an investigator can fingerprint a sensitive file and inspect its compression artefacts without it being transmitted anywhere.

Media crosses the network only when you ask for AI interpretation, and that is an explicit, visible action.

## 🧬 Key Features

| Feature | What it does | Where the answer comes from |
| --- | --- | --- |
| **Forensic Canvas** | Error Level Analysis, sensor noise and edge detection over the ingested pixels | Measured in your browser |
| **Evidence Integrity** | SHA-256 digest and EXIF tags for the exact bytes submitted | Measured in your browser |
| **Context Check** | Compares the claimed location, date and caption against what the media shows | Model |
| **Forensic Replay™** | The sequence of observed changes from origin to the copy in hand | Model |
| **Digital Crime Scene** | The five forensic questions — who, where, when, what changed, how it spread | Model |
| **Cross-Examination** | Ask follow-up questions about the case, one request at a time | Model |
| **Origin Echo** | An estimate of the earliest state, always labelled as an estimate | Model, when it provides one |
| **Media Family** | Related copies of the same media across platforms | Not yet — see below |
| **Forensic Report** | Assembles the case into an exportable dossier | Assembled from the above |

**Media Family reports no related copies.** Identifying other versions of a file requires a reverse-image or perceptual-hash search across platforms, and this build performs neither. Rather than showing a plausible-looking lineage, the panel says `NOT_ASSESSED`. It is listed here because the case structure supports it and connecting a real source is the obvious next step, not because it currently returns results.

## ✅ What Appears On Screen

**If a value is shown, it was either measured from the file or returned by the model.**

No confidence score, platform name, timestamp or copy count is written by a developer and displayed as a finding. Where there is no answer, the interface shows `NOT_ASSESSED` — grey, with no verdict colour and no percentage — rather than filling the gap.

A failed analysis produces a visible error and a case that still carries its real hash and metadata. It never produces a green tick.

Reference cases loaded from **Demo Mode** are stored fixtures used to demonstrate the workflow offline. They are badged as precomputed for the whole life of the case so they cannot be mistaken for a live result.

## 🕵️ Investigator Assistance

Anamnesis is designed to **assist investigators, not replace them**.

AI-assisted findings help reduce repetitive work while the investigator remains responsible for reviewing evidence, verifying findings and making decisions.

## 🔄 Workflow

1. Ingest
2. Analyse
3. Connect
4. Investigate
5. Report

## 🛠️ Running It

One Node process serves the single-page application and three JSON routes on the same origin. There is no second service and no database.

```bash
bun install
cp .env.example .env      # then fill in GEMINI_API_KEY
bun run dev                # .env.example sets NODE_ENV=development
```

Production build and start:

```bash
bun run build             # vite emits dist/ ; esbuild emits dist/server.cjs
bun run start
```

Or as a container:

```bash
docker build --build-arg API_SHARED_SECRET=your-secret -t anamnesis .
docker run --rm -p 3000:3000 --env-file .env anamnesis
```

`GET /api/health` reports the resolved model, the request timeout, whether authentication is required and the rate-limit settings — so a misconfigured deployment is visible before a demonstration rather than during one.

### Configuration

| Variable | Required | Notes |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Server only. Never sent to the browser. |
| `GEMINI_MODEL` | No | Defaults to a verified model ID. Logged at startup and reported by `/api/health`. |
| `API_SHARED_SECRET` | In production | Required on both POST routes. Needed at **build** time too — see below. |
| `GEMINI_TIMEOUT_MS` | No | Deadline per model call. Defaults to 30000; values under 10000 are raised, as the API rejects shorter deadlines. |
| `PORT` | No | Injected by most platforms. Falls back to 3000. |
| `NODE_ENV` | No | `development` enables the Vite middleware. Production is the default. |
| `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` | No | Per-IP limit on the POST routes. Defaults to 12 per minute. |

`API_SHARED_SECRET` is compiled into the client bundle at build time, because the browser has to present it. Setting it only as a runtime variable gives you a server that demands the header and a client that never sends one. Rotating it requires a rebuild.

## ⚠️ Scope And Limitations

This is a hackathon prototype, and it is worth being precise about what that means.

- **Authentication is a stub.** The login screen does not authenticate anyone. Real departmental identity, role-based access control, encrypted evidence storage and audit logging are the correct production answer and are deliberately out of scope for this build.
- **The shared secret is a gate, not a credential.** It stops drive-by traffic against a public URL. Because the browser must present it, anyone who opens developer tools can read it.
- **Rate limiting is per process and held in memory.** It resets on restart and does not coordinate across instances.
- **Cases are stored in `localStorage`,** scoped to one browser. Media bytes are never written to storage; they live in memory for the session, so reopening a saved case cannot re-run pixel analysis on it.
- **AI-assisted findings require human verification** and are not definitive forensic conclusions.

## 🏆 Hackathon

Developed for the **Chandigarh Police National Hackathon 2026**.

## 👥 Team

**ANAMNESIS**

Team Leader: **Khushi Lakhanpal**

Amity University Punjab

## 📌 Future Scope

- Reverse-image and perceptual-hash search to make Media Family return real lineage
- Production-grade forensic pipelines
- Secure departmental authentication and role-based access control
- Encrypted evidence storage and audit logging
- Larger-scale media lineage analysis
- Robustness testing against adversarial transformations
