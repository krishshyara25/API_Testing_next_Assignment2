import clientPromise from '../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const min = parseInt(url.searchParams.get('min')) || 0;
    const maxParam = url.searchParams.get('max');
    const max = maxParam ? parseInt(maxParam) : null;

    if (isNaN(min) || (maxParam && isNaN(max))) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }

    const filter = { headcount: { $gte: min } };
    if (max !== null) filter.headcount.$lte = max;

    const client = await clientPromise;
    const db = client.db("MyDatabase");
    const coll = db.collection("companies");

    const items = await coll.find(filter).toArray();
    return NextResponse.json(items, { status: 200 });
  } catch (err) {
    console.error("GET /api/companies/headcount-range error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
