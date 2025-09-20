// tests/api.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Next.js (App Router) Companies API', () => {
  // 1. GET /api/companies/count
  test('GET /api/companies/count returns total', async ({ request }) => {
    const res = await request.get('/api/companies/count');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('total');
    expect(typeof body.total).toBe('number');
    expect(body.total).toBeGreaterThan(0);
  });

  test('GET /api/companies/count with filter name=Microsoft', async ({ request }) => {
    const res = await request.get('/api/companies/count?name=Microsoft');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('total');
    expect(body.total).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/companies/count with non-existing name returns 0', async ({ request }) => {
    const res = await request.get('/api/companies/count?name=NoSuchCompany123');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.total).toBe(0);
  });

  // 2. GET /api/companies/top-paid
  test('GET /api/companies/top-paid returns max 5 by default', async ({ request }) => {
    const res = await request.get('/api/companies/top-paid');
    expect(res.status()).toBe(200);
    const items = await res.json();
    expect(Array.isArray(items)).toBeTruthy();
    expect(items.length).toBeLessThanOrEqual(5);
  });

  test('GET /api/companies/top-paid is sorted desc by salary', async ({ request }) => {
    const res = await request.get('/api/companies/top-paid?limit=10');
    expect(res.status()).toBe(200);
    const items = await res.json();
    const salaries = items.map(c => c.salaryBand?.base ?? 0);
    const sorted = [...salaries].sort((a, b) => b - a);
    expect(salaries).toEqual(sorted);
  });

  test('GET /api/companies/top-paid with limit=10 returns up to 10', async ({ request }) => {
    const res = await request.get('/api/companies/top-paid?limit=10');
    expect(res.status()).toBe(200);
    const items = await res.json();
    expect(items.length).toBeLessThanOrEqual(10);
  });

  // 3. GET /api/companies/by-skill/:skill
  test('GET /api/companies/by-skill/DSA returns companies requiring DSA', async ({ request }) => {
    const res = await request.get('/api/companies/by-skill/DSA');
    expect(res.status()).toBe(200);
    const items = await res.json();
    if (items.length > 0) {
      expect(items[0].hiringCriteria.skills).toEqual(
        expect.arrayContaining([expect.stringMatching(/dsa/i)])
      );
    }
  });

  test('GET /api/companies/by-skill/dsa works case-insensitively', async ({ request }) => {
    const res1 = await request.get('/api/companies/by-skill/DSA');
    const res2 = await request.get('/api/companies/by-skill/dsa');
    expect(await res1.json()).toEqual(await res2.json());
  });

  test('GET /api/companies/by-skill/NonExistSkill returns empty', async ({ request }) => {
    const res = await request.get('/api/companies/by-skill/NonExistSkill');
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  // 4. GET /api/companies/by-location/:location
  test('GET /api/companies/by-location/Hyderabad returns companies', async ({ request }) => {
    const res = await request.get('/api/companies/by-location/Hyderabad');
    expect(res.status()).toBe(200);
    const items = await res.json();
    if (items.length > 0) {
      expect(items[0].location).toMatch(/Hyderabad/i);
    }
  });

  test('GET /api/companies/by-location/hyderabad works case-insensitively', async ({ request }) => {
    const res1 = await request.get('/api/companies/by-location/Hyderabad');
    const res2 = await request.get('/api/companies/by-location/hyderabad');
    expect(await res1.json()).toEqual(await res2.json());
  });

  test('GET /api/companies/by-location/NowhereCity returns empty', async ({ request }) => {
    const res = await request.get('/api/companies/by-location/NowhereCity');
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  // 5. GET /api/companies/headcount-range
  test('GET /api/companies/headcount-range?min=1000 returns companies with headcount >= 1000', async ({ request }) => {
    const res = await request.get('/api/companies/headcount-range?min=1000');
    expect(res.status()).toBe(200);
    const items = await res.json();
    if (items.length > 0) {
      expect(items[0].headcount).toBeGreaterThanOrEqual(1000);
    }
  });

  test('GET /api/companies/headcount-range?min=1000&max=5000 returns companies in range', async ({ request }) => {
    const res = await request.get('/api/companies/headcount-range?min=1000&max=5000');
    expect(res.status()).toBe(200);
    const items = await res.json();
    if (items.length > 0) {
      expect(items[0].headcount).toBeGreaterThanOrEqual(1000);
      expect(items[0].headcount).toBeLessThanOrEqual(5000);
    }
  });

  test('GET /api/companies/headcount-range with invalid min returns 400 or default', async ({ request }) => {
    const res = await request.get('/api/companies/headcount-range?min=abc');
    expect([200, 400]).toContain(res.status());
  });

  // 6. GET /api/companies/benefit/:benefit
  test('GET /api/companies/benefit/Insurance returns companies with Insurance benefit', async ({ request }) => {
    const res = await request.get('/api/companies/benefit/Insurance');
    expect(res.status()).toBe(200);
    const items = await res.json();
    if (items.length > 0) {
      const benefits = items[0].benefits.map(b => b.toLowerCase());
      expect(benefits.join(' ')).toContain('insurance');
    }
  });

  test('GET /api/companies/benefit/insurance works case-insensitively', async ({ request }) => {
    const res1 = await request.get('/api/companies/benefit/Insurance');
    const res2 = await request.get('/api/companies/benefit/insurance');
    expect(await res1.json()).toEqual(await res2.json());
  });

  test('GET /api/companies/benefit/NonBenefitXYZ returns empty', async ({ request }) => {
    const res = await request.get('/api/companies/benefit/NonBenefitXYZ');
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual([]);
  });
});
