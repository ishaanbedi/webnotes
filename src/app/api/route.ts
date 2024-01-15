import { NextRequest, NextResponse } from "next/server";
import { getXataClient } from "@/lib/xata";

const xata = getXataClient();

export async function GET(request: NextRequest) {
  const API_ACCESS_KEY = process.env.API_ACCESS_KEY;
  if (!API_ACCESS_KEY) {
    return NextResponse.next();
  }
  const { searchParams } = new URL(request.url);
  const noteJSONinString = searchParams.get("note");
  return Response.json({ note: noteJSONinString });
}

export async function POST(request: NextRequest) {
  const API_ACCESS_KEY = process.env.API_ACCESS_KEY;
  if (!API_ACCESS_KEY) {
    return NextResponse.next();
  }
  const body = await request.json();
  const stringJSON = JSON.stringify(body);
  try {
    const record = await xata.db.webnotes2.create({
      note: stringJSON,
    });
    return NextResponse.json({
      slug: record.id.slice(4),
    });
  } catch (error) {
    return NextResponse.json({
      error: true,
    });
  }
}
