import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

/**
 * Refresca las páginas públicas después de un cambio en /admin.
 * Solo acepta el JWT de un usuario que sea administrador (verificado con is_admin()).
 */
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sb = getServerSupabase(token);
  if (!sb) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const { data: isAdmin, error } = await sb.rpc("is_admin");
  if (error || !isAdmin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true });
}
