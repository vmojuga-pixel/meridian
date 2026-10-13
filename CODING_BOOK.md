# Meridian Coding Book

Log masalah + fix. Format: **Masalah -> Punca -> Fix**.

---

## 1. Heredoc clash dengan delimiter

**Masalah:** Paste heredoc, delimiter overlap dengan content, fail rosak separuh.

**Punca:** Delimiter terlalu umum (`EOF`, `END`) dan muncul dalam content.

**Fix:** Guna delimiter unik (`ZZZ_XXX_ZZZ`). Sentiasa verify dengan `tail -5` dan `node --check` selepas tulis.

---

## 2. Terminal mobile garbled display

**Masalah:** Terminal nampak overlap text, nampak macam fail rosak.

**Punca:** Display buffer glitch kat mobile SSH, bukan fail betul-betul rosak.

**Fix:** Verify dengan `wc -l`, `head`, `tail`, `node --check`, `grep -c`. Jangan percaya display semata-mata.

---

## 3. Wrong working directory

**Masalah:** `cat > src/api/ingest.js: No such file or directory`.

**Punca:** Berada di `~` bukan `~/meridian-core`.

**Fix:** Sentiasa `pwd` dan `ls` sebelum tulis fail.

---

## 4. Cloudflare Durable Object: idFromName

**Masalah:** Tak tahu macam mana nak route ke DO spesifik.

**Punca:** Perlu tenant ID deterministik.

**Fix:** `env.TENANT.idFromName(tenantId)` -> `env.TENANT.get(id)`.

---

## 5. D1 prepared statement dengan null

**Masalah:** Insert gagal bila ada field undefined.

**Punca:** D1 tak terima `undefined`, kena `null`.

**Fix:** Guna `value ?? null`.

---

## 6. Workers AI response shape

**Masalah:** `response.response` undefined.

**Punca:** Workers AI kadang return object berbeza.

**Fix:** Fallback `response.response ?? "(no response)"`.

---

## 7. Rate limit pakai KV TTL

**Masalah:** Nak limit 1 command per 5s per machine.

**Punca:** KV tak ada atomic counter.

**Fix:** Simpan timestamp. Kalau `now - last < 5000` -> reject.

---

## Best Practice

1. Verify setiap fail lepas tulis: `node --check <file>`.
2. Guna `wc -l` untuk detect fail terpotong.
3. Guna delimiter unik untuk heredoc.
4. Simpan semua D1 schema dalam `migrations/`.
5. Audit log -> D1 + R2 (redundant).
6. LLM = advisor only. Rules = controller.
7. Jangan simpan API key plaintext. SHA-256 hash.

---

## Meridian-specific entries

### 101. Heredoc terputus — display glitch mobile

**Masalah:** Output terminal nampak garbled, fail seolah rosak.

**Punca:** Mobile SSH buffer glitch, bukan fail sebenar.

**Fix:** Verify dengan `wc -l`, `head`, `tail`, `grep -c` sebelum percaya display.

### 102. Nested backtick dalam template literal

**Masalah:** `SyntaxError: Unexpected token 'class'`.

**Punca:** Template literal guna backtick dalam backtick.

**Fix:** Guna string concat: `'<span class="' + cls + '">' + s + '</span>'`.

### 103. Route order — public endpoint kena sebelum auth

**Masalah:** `/api/meri/public` bagi 401.

**Punca:** Route terletak selepas `requireAuth`.

**Fix:** Public routes di atas, sebelum `requireAuth`. Check dengan `grep -n "requireAuth\|meri/public" src/index.js`.

### 104. Token CF vs API_TOKEN generic

**Masalah:** Wrangler error `Invalid format for Authorization header [code: 6111]`.

**Punca:** `API_TOKEN` dalam `.env` bukan token CF. Salah overwrite.

**Fix:** Guna `/root/.cf-key` untuk token CF. Jangan letak dalam `.env` yang shared dengan projek lain.

### 105. Raw data bocor ke cloud

**Masalah:** Cloud simpan setiap bacaan mentah, langgar blueprint.

**Punca:** DO `INSERT INTO telemetry` untuk setiap ingest.

**Fix:** Gateway simpan raw dalam SQLite tempatan. Hantar aggregate sahaja. Cloud UPSERT ke `telemetry_agg`.

### 106. LLM bocor detail teknikal

**Masalah:** Meri sebut "Cloudflare", "Durable Objects", nama vendor.

**Punca:** Llama 3.2 3B tak ikut prompt kuat.

**Fix:** Output sanitizer server-side — buang ayat yang ada term dalam BANNED list.

### 107. Rate limit ikut IP, bukan user

**Masalah:** Meri public disalah guna.

**Punca:** Tiada had.

**Fix:** KV counter key `rl:meri:public:<IP>`, max 10/jam, expirationTtl 3600.

### 108. Redirect vs JSON untuk HTML page

**Masalah:** `/dashboard` tanpa login bagi `{"error":"Unauthorized"}`.

**Punca:** Route HTML selepas auth check, tapi return raw error.

**Fix:** Kalau path HTML (`/dashboard`, `/meri`, `/onboarding`), redirect 302 ke `/login`. Kalau API, return JSON.
