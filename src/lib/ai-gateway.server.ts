import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createHistorianModel(apiKey: string) {
  const provider = createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  return provider("google/gemini-3-flash-preview");
}
