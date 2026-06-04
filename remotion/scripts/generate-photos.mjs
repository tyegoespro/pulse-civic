#!/usr/bin/env node
// =============================================================================
// Generates photorealistic before/after street photos for the Pulse promo
// video via Gemini 2.5 Flash Image (nano-banana). The "after" image is
// generated with the "before" image as a visual reference so the two shots
// look like the same location at different times.
//
// Reads VITE_GEMINI_API_KEY from ../../.env.local
// Writes to ../public/photos/before.jpg and after.jpg
//
// Run:  cd remotion && node scripts/generate-photos.mjs
// =============================================================================

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..', '..')
const photosDir = path.resolve(__dirname, '..', 'public', 'photos')

// ─── Load API key from .env.local ─────────────────────────────────────────
const envPath = path.join(repoRoot, '.env.local')
let apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
if (!apiKey && fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8')
  const m = env.match(/^VITE_GEMINI_API_KEY=(.+)$/m)
  if (m) apiKey = m[1].trim().replace(/^"|"$/g, '')
}
if (!apiKey || apiKey === 'your_gemini_key_here') {
  console.error('✗ VITE_GEMINI_API_KEY not set in .env.local')
  process.exit(1)
}

// ─── Image generation ─────────────────────────────────────────────────────
// Tries Imagen 4 (predict endpoint, text-only) first. If reference images
// are passed we fall back to a Gemini image model (generateContent) since
// Imagen doesn't accept image inputs.

const callImagen = async (prompt) => {
  const model = 'imagen-4.0-fast-generate-001'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: '16:9' }
    })
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(`Imagen HTTP ${res.status}: ${JSON.stringify(json).slice(0, 500)}`)
  }
  const pred = json.predictions?.[0]
  const b64 = pred?.bytesBase64Encoded || pred?.image?.bytesBase64Encoded
  if (!b64) throw new Error(`No image returned. Response: ${JSON.stringify(json).slice(0, 500)}`)
  return Buffer.from(b64, 'base64')
}

// Free public image gen (no auth, no key) — Pollinations. Their free tier
// works only when called WITHOUT premium query params (width/height/model/seed
// all return 402). Default dimensions are 1024×1024 which is fine — Remotion
// scales for display anyway.
const callPollinations = async (prompt) => {
  const encoded = encodeURIComponent(prompt)
  const url = `https://image.pollinations.ai/prompt/${encoded}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Pollinations HTTP ${res.status}`)
  const ab = await res.arrayBuffer()
  return Buffer.from(ab)
}

const callGemini = async (parts) => {
  const model = 'gemini-2.5-flash-image'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: { responseModalities: ['IMAGE'] }
    })
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(`Gemini HTTP ${res.status}: ${JSON.stringify(json).slice(0, 500)}`)
  }
  const candidate = json.candidates?.[0]
  const imagePart = candidate?.content?.parts?.find(p => p.inlineData)
  if (!imagePart) {
    throw new Error(`No image returned. Response: ${JSON.stringify(json).slice(0, 500)}`)
  }
  return Buffer.from(imagePart.inlineData.data, 'base64')
}

// ─── Prompts ─────────────────────────────────────────────────────────────

const BEFORE_PROMPT = `A wide photorealistic photograph of a residential city street in mid-afternoon. The camera is at eye level, looking down the road. The pavement is dark asphalt with visible cracks, weathering, and a large pothole approximately three feet wide in the foreground center, with rough crumbled edges and broken asphalt around it. Faded yellow centerline visible. Modest two-story brick and clapboard houses line both sides of the street. A few parked cars at the edges. Overcast bleak sky. Documentary news photography style. Shot on a 35mm lens, sharp focus, natural light, no people. Color realistic, slightly cool tones. 16:9 aspect ratio.`

const AFTER_PROMPT = `A wide photorealistic photograph of the same residential city street in mid-afternoon, taken from the exact same camera angle and position as the reference image. The pothole is now completely gone, the road has been freshly repaved with smooth, dark, even asphalt. Bright crisp white edge line and freshly painted yellow centerline dashes are visible. The same two-story brick and clapboard houses line the street, same parked cars at the edges. Sunnier sky with some blue showing. Documentary news photography style. Shot on a 35mm lens, sharp focus, natural light, no people. Color realistic, slightly warmer tones than the before image. 16:9 aspect ratio.`

// ─── Run ─────────────────────────────────────────────────────────────────

fs.mkdirSync(photosDir, { recursive: true })

const beforePath = path.join(photosDir, 'before.jpg')
const afterPath = path.join(photosDir, 'after.jpg')

// Try Imagen/Gemini first (paid), fall back to Pollinations (free).
// Same seed for both images so the underlying scene matches as closely as possible.
const SEED = 7

const tryWithFallback = async (label, prompt) => {
  try {
    return { buf: await callImagen(prompt), source: 'Imagen 4 Fast' }
  } catch (err) {
    console.log(`  ! ${label} via Imagen failed (${err.message.slice(0, 70)}…)`)
    console.log(`  → Falling back to Pollinations (free)…`)
    return { buf: await callPollinations(prompt, SEED), source: 'Pollinations Flux' }
  }
}

if (!fs.existsSync(beforePath)) {
  console.log('→ Generating before.jpg…')
  const { buf, source } = await tryWithFallback('before', BEFORE_PROMPT)
  fs.writeFileSync(beforePath, buf)
  console.log(`  ✓ ${beforePath} (${(buf.length / 1024).toFixed(0)} KB via ${source})`)
} else {
  console.log(`  ✓ ${beforePath} (exists, skipping)`)
}

if (!fs.existsSync(afterPath)) {
  console.log('→ Generating after.jpg…')
  const { buf, source } = await tryWithFallback('after', AFTER_PROMPT)
  fs.writeFileSync(afterPath, buf)
  console.log(`  ✓ ${afterPath} (${(buf.length / 1024).toFixed(0)} KB via ${source})`)
} else {
  console.log(`  ✓ ${afterPath} (exists, skipping)`)
}

console.log('\nDone. Wire into PulsePromo.tsx via staticFile("photos/before.jpg") / staticFile("photos/after.jpg").')
