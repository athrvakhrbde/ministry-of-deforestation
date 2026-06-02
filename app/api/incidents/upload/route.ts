import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ urls: [] });
    }

    const supabase = createServiceSupabase();
    const uploadId = randomUUID();
    const urls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        continue;
      }

      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${uploadId}/${randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error } = await supabase.storage
        .from("incident-media")
        .upload(path, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error.message);
        continue;
      }

      const { data: publicUrl } = supabase.storage
        .from("incident-media")
        .getPublicUrl(path);

      urls.push(publicUrl.publicUrl);
    }

    return NextResponse.json({ urls });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
