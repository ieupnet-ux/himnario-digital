import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/import/pdf — extrae el texto de un PDF subido desde el panel
 * administrativo para pre-cargar el formulario de nueva canción.
 * Recibe multipart/form-data con el campo "file".
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Adjuntá un archivo PDF en el campo 'file'." }, { status: 400 });
    }
    const buffer = new Uint8Array(await file.arrayBuffer());
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractText(pdf, { mergePages: true });
    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json(
      { error: "No se pudo leer el PDF. Verificá que no esté protegido ni escaneado como imagen." },
      { status: 422 }
    );
  }
}
