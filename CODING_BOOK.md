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
