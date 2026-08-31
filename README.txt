THELASTMOON RESULT WORKER V2.3 — AJAX CAPTURE

Tujuan:
Menangkap request AJAX/XHR asli yang dipakai fungsi changeHistory()
agar nanti scan rutin tidak perlu Browser Run.

Cron sengaja dinonaktifkan sementara supaya kuota Browser Run tidak
habis ketika fase capture.

Update repo GitHub thelastmoon-result-cron dengan SEMUA isi ZIP ini:
- package.json
- wrangler.toml
- README.txt
- src/index.js

Commit ke main dan tunggu Cloudflare build sukses.

Secret/binding tetap:
- RESULT_API_KEY
- RUN_TOKEN
- BROWSER

Cek:
GET /health

Target:
version: v2.3-ajax-capture
captureReady: true

Lalu jalankan SEKALI:
GET /capture?token=RUN_TOKEN_KAMU

Worker akan mencoba:
- TOTOCAMBODIA
- OREGON09
- BANGKOK 0930

dan mengembalikan request:
- method
- URL
- body
- HTTP status
- response preview
- sample rows

Jangan kirim RUN_TOKEN ke chat.
Kirim screenshot/JSON hasil /capture saja.
