import puppeteer from "@cloudflare/puppeteer";

const TARGETS = [
  "TOTO MACAU",
  "HOKIDRAW",
  "OREGON03",
  "OREGON06",
  "OREGON09",
  "OREGON12",
  "BULLSEYE",
  "CALIFORNIA",
  "CAROLINADAY",
  "FLORIDAMID",
  "HONGKONG",
  "NEVADA",
  "KENTUCKYEVE",
  "KENTUCKYMID",
  "BRUNEI 21",
  "CHELSEA 21",
  "POIPET12",
  "POIPET15",
  "POIPET22",
  "POIPET19",
  "BRUNEI 14",
  "BRUNEI 02",
  "CHELSEA 11",
  "CHELSEA 15",
  "CHELSEA 19",
  "SINGAPORE",
  "SYDNEY",
  "NEWYORKMID",
  "HUAHIN 0100",
  "HUAHIN 1630",
  "HUAHIN 2100",
  "CAROLINAEVE",
  "FLORIDAEVE",
  "MAGNUM4D",
  "NEWYORKEVE",
  "BANGKOK 0930",
  "BANGKOK 0130",
  "TOTOCAMBODIA",
  "TOTOMALI1530",
  "TOTOMALI2030",
  "TOTOMALI2330",
  "PCSO",
  "JAKARTA 1400",
  "JAKARTA 2330",
  "TOTO MACAO 5D",
  "TOTO MACAU 5D",
  "KING KONG 4D"
];

const SHIO = {
  "01":"KUDA","13":"KUDA","25":"KUDA","37":"KUDA","49":"KUDA","61":"KUDA","73":"KUDA","85":"KUDA","97":"KUDA",
  "02":"ULAR","14":"ULAR","26":"ULAR","38":"ULAR","50":"ULAR","62":"ULAR","74":"ULAR","86":"ULAR","98":"ULAR",
  "03":"NAGA","15":"NAGA","27":"NAGA","39":"NAGA","51":"NAGA","63":"NAGA","75":"NAGA","87":"NAGA","99":"NAGA",
  "04":"KELINCI","16":"KELINCI","28":"KELINCI","40":"KELINCI","52":"KELINCI","64":"KELINCI","76":"KELINCI","88":"KELINCI","00":"KELINCI",
  "05":"HARIMAU","17":"HARIMAU","29":"HARIMAU","41":"HARIMAU","53":"HARIMAU","65":"HARIMAU","77":"HARIMAU","89":"HARIMAU",
  "06":"KERBAU","18":"KERBAU","30":"KERBAU","42":"KERBAU","54":"KERBAU","66":"KERBAU","78":"KERBAU","90":"KERBAU",
  "07":"TIKUS","19":"TIKUS","31":"TIKUS","43":"TIKUS","55":"TIKUS","67":"TIKUS","79":"TIKUS","91":"TIKUS",
  "08":"BABI","20":"BABI","32":"BABI","44":"BABI","56":"BABI","68":"BABI","80":"BABI","92":"BABI",
  "09":"ANJING","21":"ANJING","33":"ANJING","45":"ANJING","57":"ANJING","69":"ANJING","81":"ANJING","93":"ANJING",
  "10":"AYAM","22":"AYAM","34":"AYAM","46":"AYAM","58":"AYAM","70":"AYAM","82":"AYAM","94":"AYAM",
  "11":"MONYET","23":"MONYET","35":"MONYET","47":"MONYET","59":"MONYET","71":"MONYET","83":"MONYET","95":"MONYET",
  "12":"KAMBING","24":"KAMBING","36":"KAMBING","48":"KAMBING","60":"KAMBING","72":"KAMBING","84":"KAMBING","96":"KAMBING"
};

const TOTO4D_SLOTS = [
  [15, "TOTOMACAU PAGI"],
  [13 * 60 + 15, "TOTOMACAU SIANG"],
  [16 * 60 + 15, "TOTOMACAU SORE"],
  [19 * 60 + 15, "TOTOMACAU MALAM I"],
  [22 * 60 + 15, "TOTOMACAU MALAM II"],
  [23 * 60 + 15, "TOTOMACAU MALAM III"]
];

const TOTO5D_SLOTS = [
  [15 * 60 + 30, "TOTOMACAU 5D SORE"],
  [21 * 60 + 30, "TOTOMACAU 5D MALAM"]
];

const KK4D_SLOTS = [
  [17 * 60 + 15, "KINGKONG 4D SORE"],
  [23 * 60 + 45, "KINGKONG 4D MALAM"]
];

function norm(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/\bPOOL\b/g, "")
    .replace(/MACAO/g, "MACAU")
    .replace(/[^A-Z0-9]/g, "");
}

function cleanNum(value) {
  const match = String(value || "").match(/\d{1,6}/);
  return match ? match[0] : "";
}

function shioOf(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits
    ? (SHIO[digits.slice(-2).padStart(2, "0")] || "")
    : "";
}

function toMin(time) {
  const match = String(time || "").match(/^(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function nearest(time, slots, fallback) {
  const current = toMin(time);
  if (current === null) return fallback;

  let best = slots[0];
  let diff = Infinity;

  for (const slot of slots) {
    const raw = Math.abs(current - slot[0]);
    const distance = Math.min(raw, 1440 - raw);

    if (distance < diff) {
      diff = distance;
      best = slot;
    }
  }

  return best[1];
}

function displayName(poolName, time) {
  const n = norm(poolName);

  if (n === norm("TOTO MACAO 5D") || n === norm("TOTO MACAU 5D")) {
    return nearest(time, TOTO5D_SLOTS, "TOTOMACAU 5D");
  }

  if (n === norm("KING KONG 4D")) {
    return nearest(time, KK4D_SLOTS, "KINGKONG 4D");
  }

  if (n === norm("TOTO MACAU")) {
    return nearest(time, TOTO4D_SLOTS, "TOTOMACAU");
  }

  return String(poolName || "")
    .replace(/\s+POOL$/i, "")
    .trim();
}

function resultText(row) {
  const lines = [
    `Hasil Pengeluaran ${row.display}`,
    `Tanggal ${row.date}`,
    row.display
  ];

  if (row.n2 || row.n3) {
    lines.push(`Prize 1 : ${row.n1 || "-"}`);
    lines.push(`Prize 2 : ${row.n2 || "-"}`);
    lines.push(`Prize 3 : ${row.n3 || "-"}`);
    lines.push(`SHIO Prize 1 : ${row.shio || "-"}`);
  } else {
    lines.push(`Result : ${row.n1 || "-"}`);
    lines.push(`SHIO : ${row.shio || "-"}`);
  }

  lines.push("Selamat Kepada Pemenang, Salam JP");
  return lines.join("\n");
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function postRows(env, rows) {
  const baseUrl = String(
    env.THELASTMOON_URL || "https://thelastmoon.pages.dev"
  ).replace(/\/+$/, "");

  const apiKey = String(env.RESULT_API_KEY || "").trim();

  if (!apiKey) {
    throw new Error("Secret RESULT_API_KEY belum diset.");
  }

  const CHUNK = 150;
  let saved = 0;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const part = rows.slice(i, i + CHUNK);

    const response = await fetch(
      `${baseUrl}/api/external/results`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          rows: part.map(row => ({
            ...row,
            resultText: resultText(row)
          }))
        })
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.error ||
        `TheLastMoon API HTTP ${response.status}`
      );
    }

    saved += Number(data.saved || part.length);
  }

  return saved;
}

async function scanAllMarkets(env) {
  const sourceUrl = String(
    env.SOURCE_URL || "https://luna34849.com/history/number"
  ).trim();

  const browser = await puppeteer.launch(env.BROWSER);

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1280,
      height: 900
    });

    await page.goto(sourceUrl, {
      waitUntil: "networkidle2",
      timeout: 30000
    });

    await page.waitForSelector("#pool-name", {
      timeout: 15000
    });

    await page.waitForSelector("#isihistory", {
      timeout: 15000
    });

    const options = await page.evaluate((targets) => {
      const normalize = value => String(value || "")
        .toUpperCase()
        .replace(/\bPOOL\b/g, "")
        .replace(/MACAO/g, "MACAU")
        .replace(/[^A-Z0-9]/g, "");

      const allowed = new Set(
        targets.map(normalize)
      );

      const select = document.querySelector("#pool-name");

      return Array.from(select?.options || [])
        .map((option, index) => ({
          index,
          name: String(
            option.getAttribute("data-name") ||
            option.textContent ||
            ""
          ).trim(),
          code: String(
            option.getAttribute("data-code") || ""
          ).trim(),
          value: String(option.value || "")
        }))
        .filter(item => allowed.has(normalize(item.name)));
    }, TARGETS);

    const all = [];

    for (const item of options) {
      const before = await page.evaluate(() => {
        const box = document.querySelector("#isihistory");
        return box
          ? String(box.innerText || "").replace(/\s+/g, " ").trim().slice(0, 1200)
          : "";
      });

      await page.evaluate((payload) => {
        const select = document.querySelector("#pool-name");
        if (!select) return;

        select.selectedIndex = payload.index;

        const option = select.options[payload.index];
        if (option) option.selected = true;

        let called = false;

        try {
          if (payload.code && typeof window.changeHistory === "function") {
            window.changeHistory(payload.code);
            called = true;
          }
        } catch (_) {}

        if (!called) {
          try {
            if (typeof window.changeHistory === "function") {
              window.changeHistory(select.value);
              called = true;
            }
          } catch (_) {}
        }

        if (!called && window.jQuery) {
          try {
            window.jQuery(select)
              .val(select.value)
              .trigger("change");
            called = true;
          } catch (_) {}
        }

        if (!called) {
          select.dispatchEvent(
            new Event("input", { bubbles: true })
          );
          select.dispatchEvent(
            new Event("change", { bubbles: true })
          );
        }
      }, item);

      try {
        await page.waitForFunction(
          previous => {
            const box = document.querySelector("#isihistory");
            const now = box
              ? String(box.innerText || "").replace(/\s+/g, " ").trim().slice(0, 1200)
              : "";
            return Boolean(now && now !== previous);
          },
          {
            timeout: 2200
          },
          before
        );
      } catch (_) {
        await sleep(250);
      }

      const rawRows = await page.evaluate(() => {
        const table =
          document.querySelector("#isihistory table") ||
          document.querySelector("#isihistory");

        if (!table) return [];

        const out = [];

        for (const tr of table.querySelectorAll("tbody tr")) {
          const cells = Array.from(tr.querySelectorAll("td"))
            .map(td => String(td.textContent || "")
              .replace(/\s+/g, " ")
              .trim()
            );

          if (cells.length < 3) continue;

          let dateIdx = cells.findIndex(value =>
            /\b\d{4}-\d{2}-\d{2}\b/.test(value)
          );

          if (dateIdx < 0) continue;

          const dateMatch = cells[dateIdx].match(
            /(\d{4}-\d{2}-\d{2})/
          );

          if (!dateMatch) continue;

          let time = "";

          const sameCellTime = cells[dateIdx].match(
            /(\d{1,2}:\d{2}:\d{2})/
          );

          if (sameCellTime) {
            time = sameCellTime[1];
          } else if (
            /^\d{1,2}:\d{2}:\d{2}$/.test(
              cells[dateIdx + 1] || ""
            )
          ) {
            time = cells[dateIdx + 1];
          }

          const start =
            time &&
            cells[dateIdx + 1] === time
              ? dateIdx + 2
              : dateIdx + 1;

          const numbers = [];

          for (let i = start; i < cells.length; i++) {
            if (/^\d{1,6}$/.test(cells[i])) {
              numbers.push(cells[i]);
            }
          }

          if (!numbers.length) continue;

          out.push({
            periode: String(cells[0] || "").trim(),
            date: dateMatch[1],
            time,
            n1: numbers[0] || "",
            n2: numbers[1] || "",
            n3: numbers[2] || ""
          });

          if (out.length >= 10) break;
        }

        return out;
      });

      for (const raw of rawRows) {
        const n1 = cleanNum(raw.n1);
        if (!n1) continue;

        all.push({
          pool: item.name,
          display: displayName(item.name, raw.time),
          periode: raw.periode,
          date: raw.date,
          time: raw.time,
          n1,
          n2: cleanNum(raw.n2),
          n3: cleanNum(raw.n3),
          shio: shioOf(n1)
        });
      }

      await sleep(80);
    }

    const dedupe = new Map();

    for (const row of all) {
      const key = [
        row.pool,
        row.display,
        row.date,
        row.time,
        row.periode,
        row.n1,
        row.n2,
        row.n3
      ].join("|");

      dedupe.set(key, row);
    }

    const rows = Array.from(dedupe.values());

    const saved = await postRows(env, rows);

    return {
      ok: true,
      sourceUrl,
      markets: options.length,
      rows: rows.length,
      saved,
      dates: [...new Set(rows.map(row => row.date))]
        .sort()
        .reverse()
        .slice(0, 10)
    };
  } finally {
    await browser.close();
  }
}

async function run(env) {
  try {
    const result = await scanAllMarkets(env);

    return Response.json({
      version: "v2-browser-run",
      ...result
    });
  } catch (error) {
    return Response.json({
      ok: false,
      version: "v2-browser-run",
      error: error?.message || String(error)
    }, {
      status: 500
    });
  }
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(run(env));
  },

  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return Response.json({
        ok: true,
        version: "v2-browser-run",
        browserBinding: Boolean(env.BROWSER),
        resultApiKeyConfigured: Boolean(
          String(env.RESULT_API_KEY || "").trim()
        ),
        sourceUrl:
          env.SOURCE_URL ||
          "https://luna34849.com/history/number"
      });
    }

    if (url.pathname === "/run") {
      const supplied = String(
        request.headers.get("X-Run-Token") ||
        url.searchParams.get("token") ||
        ""
      );

      const expected = String(
        env.RUN_TOKEN || ""
      );

      if (!expected || supplied !== expected) {
        return Response.json({
          ok: false,
          error: "RUN_TOKEN tidak valid."
        }, {
          status: 401
        });
      }

      return run(env);
    }

    return Response.json({
      ok: true,
      worker: "TheLastMoon Result Browser Worker",
      version: "v2-browser-run",
      endpoints: ["/health", "/run"]
    });
  }
};
