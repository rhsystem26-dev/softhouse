import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { classifyMessage } from "@/lib/server/whatsapp-command-classifier";
import { parsePayload } from "@/lib/server/whatsapp-command-parser";
import { insertCommand, checkDuplicateCommand } from "@/lib/server/whatsapp-command-repository";
import { evaluateConfirmation, getRiskLevel } from "@/lib/server/whatsapp-confirmation-service";
import { recordPipelineEvent } from "@/lib/server/whatsapp-audit-service";
import { safeError } from "@/lib/server/safe-log";
import { incrementIAProcessed, incrementIAFailed } from "@/lib/server/observability";

// Compatibilidade: ainda exporta processWebhookWithIA do módulo antigo
// para não quebrar chamadas existentes
import { processWebhookWithIA as legacyProcess } from "@/lib/server/ia-project-manager";

function validateInternalKey(request: NextRequest): boolean {
  const key = request.headers.get("x-internal-api-key");
  const expected = process.env.INTERNAL_API_KEY;
  if (!expected || !key) return false;
  return key === expected;
}

export async function POST(request: NextRequest) {
  // Proteção: apenas chamadas internas com API key
  if (!validateInternalKey(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { webhookLogId } = body;

  if (!webhookLogId || typeof webhookLogId !== "string") {
    return NextResponse.json({ ok: false, error: "webhookLogId required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    // Buscar webhook log
    const { data: log } = await supabase
      .from("evolution_webhook_logs")
      .select("*")
      .eq("id", webhookLogId)
      .single();

    if (!log) {
      return NextResponse.json({ ok: false, error: "webhook_log not found" }, { status: 404 });
    }

    if (log.processed) {
      return NextResponse.json({ ok: true, processed: true, duplicate: true });
    }

    const rawPayload = log.raw_payload as Record<string, unknown> | null;
    const message = extractMessage(rawPayload);
    const fromPhone = log.from_phone || "";
    const orgId = log.org_id;

    if (!message) {
      await supabase.from("evolution_webhook_logs")
        .update({ processed: true, processing_error: "No message content" })
        .eq("id", webhookLogId);
      incrementIAProcessed();
      return NextResponse.json({ ok: true, processed: true, intent: "no_message" });
    }

    if (!orgId) {
      await supabase.from("evolution_webhook_logs")
        .update({ processed: true, processing_error: "No org_id" })
        .eq("id", webhookLogId);
      incrementIAProcessed();
      return NextResponse.json({ ok: true, processed: true, intent: "no_org" });
    }

    // --- NOVO PIPELINE WHATSAPP COMMANDS ---

    // 1. Classificar
    const classification = classifyMessage(message);

    if (classification.intent === "unknown" || classification.confidence < 0.3) {
      // Marca como processado, mas não cria comando
      await supabase.from("evolution_webhook_logs")
        .update({ processed: true })
        .eq("id", webhookLogId);
      incrementIAProcessed();
      return NextResponse.json({
        ok: true,
        processed: true,
        intent: classification.intent,
        confidence: classification.confidence,
        reasoning: classification.reasoning,
      });
    }

    // 2. Verificar duplicata
    const isDuplicate = await checkDuplicateCommand(webhookLogId, classification.intent);
    if (isDuplicate) {
      await supabase.from("evolution_webhook_logs")
        .update({ processed: true })
        .eq("id", webhookLogId);
      incrementIAProcessed();
      return NextResponse.json({ ok: true, processed: true, duplicate: true });
    }

    // 3. Extrair payload
    const parsedPayload = parsePayload(message, classification.intent);

    // 4. Avaliar confirmação
    const confirmation = evaluateConfirmation(
      classification.intent,
      classification.confidence,
      parsedPayload as Record<string, unknown>
    );

    const riskLevel = getRiskLevel(classification.intent);

    // 5. Inserir comando
    const commandId = await insertCommand({
      org_id: orgId,
      webhook_log_id: webhookLogId,
      from_phone: fromPhone,
      intent: classification.intent,
      status: confirmation.status,
      risk_level: riskLevel,
      confidence: classification.confidence,
      extracted_payload: parsedPayload as Record<string, unknown>,
      missing_fields: confirmation.missingFields,
      confirmation_message: confirmation.confirmationMessage,
    });

    if (commandId) {
      await recordPipelineEvent(commandId, "classified", {
        intent: classification.intent,
        confidence: classification.confidence,
        status: confirmation.status,
        reasoning: classification.reasoning,
      }, orgId);
    }

    // 6. Marcar webhook como processado
    await supabase.from("evolution_webhook_logs")
      .update({ processed: true })
      .eq("id", webhookLogId);

    // 7. Também rodar pipeline legado (task_ai_suggestions) para compatibilidade
    try {
      await legacyProcess(webhookLogId);
    } catch {
      // Legacy pipeline failure is non-blocking
    }

    incrementIAProcessed();
    return NextResponse.json({
      ok: true,
      processed: true,
      command_id: commandId,
      intent: classification.intent,
      confidence: classification.confidence,
      status: confirmation.status,
      reasoning: classification.reasoning,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "internal_error";
    safeError("IA process webhook failed", { error: message });
    incrementIAFailed();
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractMessage(payload: Record<string, unknown> | null): string | null {
  if (!payload) return null;
  const data = (payload.data || payload.message || payload) as Record<string, unknown>;
  const msg = data?.message as Record<string, unknown> | undefined;
  return (msg?.conversation || msg?.text || msg?.body || data?.conversation || data?.text || data?.body || null) as string | null;
}
