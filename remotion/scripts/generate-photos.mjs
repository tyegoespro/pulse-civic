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

// ─── Image generation via Gemini 2.5 Flash Image REST API ────────────────
const MODEL = 'gemini-2.5-flash-image-preview'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`

const callGemini = async (parts) => {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        responseModalities: ['IMAGE']
      }
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

if (!fs.existsSync(beforePath)) {
  console.log('→ Generating before.jpg via Gemini 2.5 Flash Image…')
  const buf = await callGemini([{ text: BEFORE_PROMPT }])
  fs.writeFileSync(beforePath, buf)
  console.log(`  ✓ ${beforePath} (${(buf.length / 1024).toFixed(0)} KB)`)
} else {
  console.log(`  ✓ ${beforePath} (exists, skipping)`)
}

if (!fs.existsSync(afterPath)) {
  console.log('→ Generating after.jpg with before.jpg as reference…')
  const referenceImage = fs.readFileSync(beforePath).toString('base64')
  const buf = await callGemini([
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: referenceImage
      }
    },
    { text: AFTER_PROMPT }
  ])
  fs.writeFileSync(afterPath, buf)
  console.log(`  ✓ ${afterPath} (${(buf.length / 1024).toFixed(0)} KB)`)
} else {
  console.log(`  ✓ ${afterPath} (exists, skipping)`)
}

console.log('\nDone. Wire into PulsePromo.tsx via staticFile("photos/before.jpg") / staticFile("photos/after.jpg").')
