"use server";

import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabaseServer.js";

export async function POST(request) {
  try {
    const { email } = await request.json();
    const trimmed = (email || "").trim().toLowerCase();
    if (!trimmed) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data, error } = await supabaseServer.auth.admin.listUsers({ email: trimmed });
    if (error) {
      return NextResponse.json(
        { exists: false, error: error.message || "Unable to check email" },
        { status: 500 }
      );
    }

    const found = (data?.users || []).find((u) => (u.email || "").toLowerCase() === trimmed);
    if (!found) {
      return NextResponse.json({ exists: false, error: "No account found for that email." }, { status: 404 });
    }

    return NextResponse.json({ exists: true });
  } catch (err) {
    return NextResponse.json({ exists: false, error: "Unable to check email" }, { status: 500 });
  }
}
