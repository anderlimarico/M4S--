import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initial,
  command,
  state,
  forecast,
  validateBackup,
  nextPay,
} from "./core.js";
function fixture() {
  let db = initial();
  const run = (t, d) => {
    db = command(db, t, d);
    return db.events.at(-1).data;
  };
  const a = run("account", { name: "ML 1" }).id,
    p = run("product", {
      sku: "B",
      name: "Balaclava",
      accounts: [a],
      parts: [],
    }).id,
    k = run("product", {
      sku: "K3",
      name: "Kit 3",
      accounts: [a],
      parts: [{ product: p, quantity: 3 }],
    }).id;
  return {
    run,
    get db() {
      return db;
    },
    a,
    p,
    k,
  };
}
test("100 kits consomem 300 peças; trânsito, chegada parcial e saldo Full", () => {
  const f = fixture();
  f.run("adjust", { product: f.p, quantity: 1000, reason: "Inicial" });
  const sh = f.run("ship", { key: `${f.a}|${f.k}`, quantity: 100 });
  assert.equal(state(f.db).stock[f.p], 700);
  f.run("sales", {
    key: sh.key,
    s7: 70,
    s15: 120,
    s30: 200,
    days: 15,
    date: "2026-11-15",
  });
  assert.equal(forecast(state(f.db), sh.key).suggested, 50);
  f.run("receive", { shipment: sh.id, quantity: 40 });
  assert.equal(forecast(state(f.db), sh.key).transit, 60);
  assert.equal(forecast(state(f.db), sh.key).on, 40);
  assert.equal(forecast(state(f.db), sh.key).suggested, 50);
  assert.throws(() => f.run("receive", { shipment: sh.id, quantity: 61 }));
  assert.throws(() => f.run("ship", { key: sh.key, quantity: 234 }));
});
test("cortes, lote, retirada parcial, perdas e pagamento preservam saldos", () => {
  const f = fixture();
  const w = f.run("worker", {
    name: "Ana",
    neighborhood: "Centro",
    rate: 100,
    days: [15, 30],
  }).id;
  f.run("cut", { product: f.p, quantity: 500 });
  const l = f.run("lot", { product: f.p, worker: w, quantity: 250 });
  assert.equal(state(f.db).cut[f.p], 250);
  f.run("return", { lot: l.id, quantity: 100, loss: 5 });
  f.run("return", { lot: l.id, quantity: 145, loss: 0 });
  assert.equal(state(f.db).stock[f.p], 245);
  assert.equal(state(f.db).owed[w], 24500);
  assert.throws(() => f.run("return", { lot: l.id, quantity: 1, loss: 0 }));
  f.run("pay", { worker: w, cents: 4500 });
  assert.equal(state(f.db).owed[w], 20000);
  assert.throws(() => f.run("pay", { worker: w, cents: 20001 }));
  f.run("finish", { product: f.p, quantity: 250 });
  assert.equal(state(f.db).stock[f.p], 495);
  assert.throws(() => f.run("finish", { product: f.p, quantity: 1 }));
  assert.deepEqual(validateBackup(JSON.parse(JSON.stringify(f.db))), f.db);
});
test("rejeita entradas inválidas, SKUs duplicados e vendas incoerentes", () => {
  const f = fixture();
  for (const quantity of [-1, 1.5, "", NaN, Infinity])
    assert.throws(() => f.run("cut", { product: f.p, quantity }));
  assert.throws(() =>
    f.run("product", {
      sku: "b",
      name: "Duplicado",
      accounts: [f.a],
      parts: [],
    }),
  );
  assert.throws(() =>
    f.run("sales", {
      key: `${f.a}|${f.k}`,
      s7: 15,
      s15: 10,
      s30: 20,
      days: 15,
      date: "2026-11-15",
    }),
  );
  assert.throws(() => f.run("cut", { product: f.k, quantity: 1 }));
  const bad = structuredClone(f.db);
  bad.events.push({ ...bad.events[0] });
  assert.throws(() => validateBackup(bad));
});
test("sem vendas não divide por zero; acerto 30 ajustado em fevereiro", () => {
  const f = fixture(),
    key = `${f.a}|${f.k}`;
  f.run("sales", { key, s7: 0, s15: 0, s30: 0, days: 15, date: "2026-11-15" });
  assert.equal(forecast(state(f.db), key).days, null);
  assert.equal(forecast(state(f.db), key).suggested, 0);
  assert.equal(nextPay([30], new Date(2026, 1, 20)).getDate(), 28);
});
test("kit misto consome todos os componentes atomicamente", () => {
  const f = fixture();
  const p2 = f.run("product", {
    sku: "X",
    name: "Bandana",
    accounts: [f.a],
    parts: [],
  }).id;
  const kit = f.run("product", {
    sku: "MIX",
    name: "Misto",
    accounts: [f.a],
    parts: [
      { product: f.p, quantity: 2 },
      { product: p2, quantity: 1 },
    ],
  }).id;
  f.run("adjust", { product: f.p, quantity: 10, reason: "Inicial" });
  f.run("adjust", { product: p2, quantity: 3, reason: "Inicial" });
  const len = f.db.events.length;
  assert.throws(() => f.run("ship", { key: `${f.a}|${kit}`, quantity: 4 }));
  assert.equal(f.db.events.length, len);
  f.run("ship", { key: `${f.a}|${kit}`, quantity: 3 });
  assert.equal(state(f.db).stock[f.p], 4);
  assert.equal(state(f.db).stock[p2], 0);
});
