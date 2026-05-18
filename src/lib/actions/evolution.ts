"use server";
import {
  handleSaveConfig,
  handleTestConnection,
  handleSendMessage,
  handleGetConfig,
  handleGetMessageLogs,
  type MessageLogForUI,
} from "@/lib/server/evolution-service";

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  return fallback;
}

export async function saveEvolutionConfigAction(formData: FormData) {
  try {
    const input = {
      instanceUrl: formData.get("instanceUrl") as string,
      apiKey: formData.get("apiKey") as string ?? "",
      webhookSecret: formData.get("webhookSecret") as string ?? "",
      enabled: formData.get("enabled") === "true" || formData.get("enabled") === "on",
    };
    const result = await handleSaveConfig(input);
    return { success: true as const, data: result };
  } catch (err) {
    return { success: false as const, error: errorMessage(err, "Erro ao salvar configuração") };
  }
}

export async function testEvolutionConnectionAction() {
  try {
    const result = await handleTestConnection();
    return { success: true as const, data: result };
  } catch (err) {
    return { success: false as const, error: errorMessage(err, "Erro ao testar conexão") };
  }
}

export async function sendEvolutionMessageAction(formData: FormData) {
  try {
    const input = {
      toPhone: formData.get("toPhone") as string,
      message: formData.get("message") as string,
    };
    return await handleSendMessage(input);
  } catch (err) {
    return { success: false as const, error: errorMessage(err, "Erro ao enviar mensagem") };
  }
}

export async function getEvolutionConfigAction() {
  try {
    const result = await handleGetConfig();
    return { success: true as const, data: result };
  } catch (err) {
    return { success: false as const, error: errorMessage(err, "Erro ao buscar configuração") };
  }
}

export async function getEvolutionMessageLogsAction(): Promise<
  { success: true; data: MessageLogForUI[] } | { success: false; error: string }
> {
  try {
    const data = await handleGetMessageLogs();
    return { success: true as const, data };
  } catch (err) {
    return { success: false as const, error: errorMessage(err, "Erro ao buscar logs") };
  }
}
