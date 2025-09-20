import clientPromise from '../../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { benefit } = params;

    const client = await clientPromise;
    const db = client.db("MyDatabase");
    const coll = db.collection("companies");

    const items = await coll
      .find({ benefits: { $regex: new RegExp(benefit, 'i') } })
      .toArray();

    return NextResponse.json(items, { status: 200 });
  } catch (err) {
    console.error("GET /api/companies/benefit error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
