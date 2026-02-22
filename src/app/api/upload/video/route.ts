import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Verify admin auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  if (!file.type.startsWith("video/")) {
    return NextResponse.json(
      { error: "Only video files are allowed" },
      { status: 400 }
    );
  }

  // Max 500MB
  if (file.size > 500 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 500MB." },
      { status: 400 }
    );
  }

  // Generate unique filename
  const ext = file.name.split(".").pop() || "mp4";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("course-videos")
    .upload(filename, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: uploadError.message },
      { status: 500 }
    );
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("course-videos").getPublicUrl(filename);

  return NextResponse.json({ url: publicUrl });
}
