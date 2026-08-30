THELASTMOON RESULT BROWSER WORKER V2.1 — GITHUB/WRANGLER DEPLOY

PENTING:
JANGAN paste src/index.js langsung ke Cloudflare Dashboard editor.
File ini mengimpor npm package:
@cloudflare/puppeteer

Package tersebut harus di-install/bundle oleh Wrangler atau Workers Builds.

CARA PALING MUDAH:
1. Buat GitHub repo baru, misalnya:
   thelastmoon-result-cron
2. Upload SEMUA isi folder ini ke root repo:
   - package.json
   - wrangler.toml
   - src/index.js
   - README.txt
3. Cloudflare -> Worker "thelastmoon-result-cron"
4. Settings -> Builds -> Connect
5. Pilih repo GitHub tadi
6. Deploy command:
   npx wrangler deploy
7. Setelah build sukses:
   Settings -> Variables and Secrets
8. Tambahkan SECRET:
   RESULT_API_KEY
   isi dengan API Extension Result BARU dari TheLastMoon
9. Tambahkan SECRET:
   RUN_TOKEN
   isi token acak panjang buatan sendiri

Browser binding dan cron sudah ada di wrangler.toml:
[browser]
binding = "BROWSER"

[triggers]
crons = ["*/10 * * * *"]

JANGAN menulis API key langsung di src/index.js.

Jika API key pernah terlihat di screenshot/chat atau source code,
REVOKE key lama di TheLastMoon dan Generate API Extension Result baru.

TEST SETELAH DEPLOY:
GET https://<worker>.workers.dev/health

Harus:
browserBinding: true
resultApiKeyConfigured: true

Manual run:
GET https://<worker>.workers.dev/run?token=<RUN_TOKEN>
