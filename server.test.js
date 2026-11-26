"use strict";

const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const testDir = fs.mkdtempSync(path.join(os.tmpdir(), "fade-masters-api-"));
process.env.DB_PATH = path.join(testDir, "test.sqlite");
delete process.env.GOOGLE_MAPS_API_KEY;
const { createServer, db } = require("./server");
const server = createServer();
let origin;

const listen = () => new Promise(resolve => server.listen(0, "127.0.0.1", () => {
  origin = `http://127.0.0.1:${server.address().port}`;
  resolve();
}));

function request(route, { method = "GET", body, cookie } = {}) {
  return fetch(`${origin}${route}`, {
    method,
    headers: {
      Origin: origin,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(cookie ? { Cookie: cookie } : {})
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

async function json(response) {
  return response.json();
}

function sessionCookie(response) {
  return response.headers.get("set-cookie").split(";")[0];
}

test("persistent role-based marketplace API supports registered shop workflows", async () => {
  await listen();

  const health = await json(await request("/api/health"));
  assert.deepEqual(health, { ok: true, database: "sqlite" });
  const anonymous = await json(await request("/api/bootstrap"));
  assert.equal(anonymous.authenticated, false);
  assert.equal(anonymous.state.shops.length, 0);
  assert.ok(anonymous.catalog.some(service => service.id === "layercut"));

  const ownerSignup = await request("/api/auth/signup", {
    method: "POST",
    body: { role: "owner", name: "Test Owner", email: "owner@test.example", password: "OwnerPass123!" }
  });
  assert.equal(ownerSignup.status, 201);
  const ownerCookie = sessionCookie(ownerSignup);
  const ownerData = await json(ownerSignup);
  const ownerId = ownerData.user.id;

  const shop = {
    id: "shop-test-00001", ownerId, name: "Test Salon", city: "Jaipur", area: "Vaishali Nagar",
    region: "Rajasthan", address: "Test Road, Jaipur", phone: "", description: "A test salon.",
    photo: "", workPhotos: [], lat: 26.9124, lng: 75.7873, open: "Hours vary",
    services: ["layercut", "browdesign", "cleanup", "haircut"], servicePrices: {}, barberIds: []
  };
  ownerData.state.shops.push(shop);
  ownerData.state.shopStaff[shop.id] = [];
  const registration = await request("/api/state", {
    method: "PUT",
    cookie: ownerCookie,
    body: { state: ownerData.state }
  });
  assert.equal(registration.status, 200);
  assert.equal((await json(registration)).state.shops.length, 1);

  const barberResponse = await request(`/api/shops/${shop.id}/barbers`, {
    method: "POST",
    cookie: ownerCookie,
    body: {
      name: "Test Barber", email: "barber@test.example", employeeId: "FM-TEST-1001",
      password: "BarberPass123!", specialty: "Layered cuts", gender: "female",
      tier: "specialist", base: 22000, commission: 3500
    }
  });
  assert.equal(barberResponse.status, 201);
  const barberData = await json(barberResponse);
  const barberId = barberData.barber.id;
  assert.equal(barberData.invite.temporaryPassword, "BarberPass123!");
  assert.equal("password" in barberData.state.barbers[0], false);
  const storedPassword = db.prepare("SELECT password_salt,password_hash FROM users WHERE id=?").get(barberId);
  assert.notEqual(storedPassword.password_hash, "BarberPass123!");
  assert.equal(storedPassword.password_hash.length, 128);

  const customerSignup = await request("/api/auth/signup", {
    method: "POST",
    body: {
      role: "customer", name: "Test Customer", email: "customer@test.example",
      password: "CustomerPass123!", gender: "female", location: "Jaipur", state: "Rajasthan"
    }
  });
  assert.equal(customerSignup.status, 201);
  const customerCookie = sessionCookie(customerSignup);
  const customerData = await json(customerSignup);
  assert.equal(customerData.state.customer.gender, "female");

  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const booking = await request("/api/bookings", {
    method: "POST",
    cookie: customerCookie,
    body: { shopId: shop.id, barberId, serviceId: "layercut", date: tomorrow, time: "10:00" }
  });
  assert.equal(booking.status, 201);
  const bookingId = (await json(booking)).id;

  const forbiddenService = await request("/api/bookings", {
    method: "POST",
    cookie: customerCookie,
    body: { shopId: shop.id, barberId, serviceId: "haircut", date: tomorrow, time: "11:00" }
  });
  assert.equal(forbiddenService.status, 403);

  const nearby = await json(await request(`/api/shops/nearby?lat=26.9124&lng=75.7873`, { cookie: customerCookie }));
  assert.equal(nearby.shops.length, 1);
  assert.equal(nearby.shops[0].id, shop.id);
  assert.equal(nearby.shops[0].distanceKm, 0);
  const places = await json(await request("/api/discovery/places?lat=26.9124&lng=75.7873", { cookie: customerCookie }));
  assert.equal(places.available, false);
  assert.deepEqual(places.results, []);

  const barberLogin = await request("/api/auth/login", {
    method: "POST",
    body: { role: "barber", identifier: "FM-TEST-1001", password: "BarberPass123!" }
  });
  assert.equal(barberLogin.status, 200);
  const barberCookie = sessionCookie(barberLogin);
  const barberState = await json(barberLogin);
  assert.equal(barberState.user.role, "barber");
  assert.equal(barberState.state.appointments[0].status, "pending");
  barberState.state.appointments[0].status = "confirmed";
  const approved = await request("/api/state", { method: "PUT", cookie: barberCookie, body: { state: barberState.state } });
  assert.equal((await json(approved)).state.appointments[0].status, "confirmed");

  const completed = await request(`/api/bookings/${bookingId}`, {
    method: "PATCH", cookie: barberCookie, body: { status: "completed" }
  });
  assert.equal(completed.status, 200);
  const recorded = await request(`/api/bookings/${bookingId}`, {
    method: "PATCH", cookie: barberCookie, body: { paymentStatus: "paid" }
  });
  assert.equal((await json(recorded)).state.appointments[0].paymentStatus, "paid");

  const memberRequest = await request("/api/memberships", {
    method: "POST", cookie: customerCookie, body: { shopId: shop.id }
  });
  assert.equal(memberRequest.status, 201);
  const pendingMembership = (await json(memberRequest)).state.memberships[0];
  const memberApproval = await request(`/api/memberships/${pendingMembership.id}`, {
    method: "PATCH", cookie: ownerCookie, body: { status: "active" }
  });
  assert.equal((await json(memberApproval)).state.memberships[0].status, "active");

  const payroll = await request("/api/payroll", {
    method: "PUT", cookie: ownerCookie, body: { barberId, paid: true }
  });
  assert.equal((await json(payroll)).state.payrollPaid[barberId], true);
  const commission = await json(await request("/api/commission", { cookie: ownerCookie }));
  assert.equal(commission.bookings, 1);
  assert.ok(commission.estimate > 0);

  const ownerTwo = await request("/api/auth/signup", {
    method: "POST",
    body: { role: "owner", name: "Other Owner", email: "other@test.example", password: "OtherPass123!" }
  });
  const ownerTwoCookie = sessionCookie(ownerTwo);
  const denied = await request(`/api/barbers/${barberId}`, {
    method: "PATCH", cookie: ownerTwoCookie, body: { base: 50000 }
  });
  assert.equal(denied.status, 404);
  const anonymousWrite = await request("/api/state", { method: "PUT", body: { state: {} } });
  assert.equal(anonymousWrite.status, 401);

  const persisted = await json(await request("/api/bootstrap", { cookie: ownerCookie }));
  assert.equal(persisted.state.shops[0].name, "Test Salon");
  assert.equal(persisted.state.barbers[0].active, true);
  const logout = await request("/api/auth/logout", { method: "POST", cookie: ownerCookie, body: {} });
  assert.equal(logout.status, 200);
  const loggedOut = await json(await request("/api/bootstrap", { cookie: ownerCookie }));
  assert.equal(loggedOut.authenticated, false);
});

after(async () => {
  if (server.listening) await new Promise(resolve => server.close(resolve));
  db.close();
  fs.rmSync(testDir, { recursive: true, force: true });
});
