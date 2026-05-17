import "server-only";

interface EvolutionClientParams {
  instanceUrl: string;
  apiKey: string;
  timeoutMs?: number;
}

export interface EvolutionStatusResult {
  connected: boolean;
  instance?: string;
  error?: string;
}

export interface EvolutionSendResult {
  success: boolean;
  error: string | null;
  externalId: string | null;
}

export async function testEvolutionInstanceStatus(
  params: EvolutionClientParams,
): Promise<EvolutionStatusResult> {
  const { instanceUrl, apiKey, timeoutMs = 10000 } = params;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(`${instanceUrl}/instance/status`, {
      method: "GET",
      headers: { apikey: apiKey },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return { connected: false, error: `HTTP ${resp.status}: ${text.slice(0, 200)}` };
    }
    const data = (await resp.json().catch(() => null)) as
      | { instance?: { instanceName?: string } | string }
      | null;
    const instanceName =
      typeof data?.instance === "string"
        ? data.instance
        : data?.instance?.instanceName ?? "connected";
    return { connected: true, instance: instanceName };
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === "AbortError") {
      return { connected: false, error: "Timeout ao conectar na instancia" };
    }
    return { connected: false, error: "Nao foi possivel conectar a instancia da Evolution API" };
  }
}

export async function sendEvolutionTextMessage(
  params: EvolutionClientParams & { toPhone: string; message: string },
): Promise<EvolutionSendResult> {
  const { instanceUrl, apiKey, toPhone, message, timeoutMs = 15000 } = params;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(`${instanceUrl}/message/sendText/${toPhone}`, {
      method: "POST",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: message }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = (await resp.json().catch(() => null)) as
      | { message?: string; key?: { id?: string }; id?: string }
      | null;

    if (!resp.ok) {
      return {
        success: false,
        error: data?.message ?? `Erro HTTP ${resp.status}`,
        externalId: null,
      };
    }
    return {
      success: true,
      error: null,
      externalId: data?.key?.id ?? data?.id ?? null,
    };
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === "AbortError") {
      return { success: false, error: "Timeout ao enviar mensagem", externalId: null };
    }
    return {
      success: false,
      error: "Mensagem nao enviada. Verifique a instancia configurada.",
      externalId: null,
    };
  }
}
