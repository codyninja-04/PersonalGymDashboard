// Free-tier AI provider fallback chain.
// Tries Gemini keys → Groq keys → OpenRouter keys in order.
// First successful response wins. All providers fail → throws.

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AICallOptions {
  temperature?: number;
  maxTokens?: number;
  system?: string;
}

interface Provider {
  name: string;
  call: (messages: AIMessage[], options: AICallOptions) => Promise<string>;
}

function collectKeys(prefix: string): string[] {
  const keys: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const key = process.env[`${prefix}_${i}`];
    if (key && key.trim().length > 0 && !key.includes("YOUR-")) {
      keys.push(key.trim());
    }
  }
  // Also accept a single non-numbered fallback key
  const fallback = process.env[prefix];
  if (fallback && fallback.trim().length > 0 && !fallback.includes("YOUR-")) {
    keys.push(fallback.trim());
  }
  return Array.from(new Set(keys));
}

async function callGemini(apiKey: string, messages: AIMessage[], opts: AICallOptions): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      maxOutputTokens: opts.maxTokens ?? 600,
    },
  };
  if (opts.system) {
    body.systemInstruction = { parts: [{ text: opts.system }] };
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`gemini ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("gemini empty response");
  return text.trim();
}

async function callOpenAICompatible(
  apiKey: string,
  endpoint: string,
  model: string,
  messages: AIMessage[],
  opts: AICallOptions,
  extraHeaders: Record<string, string> = {},
): Promise<string> {
  const fullMessages: AIMessage[] = opts.system
    ? [{ role: "system", content: opts.system }, ...messages]
    : messages;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages: fullMessages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 600,
    }),
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${endpoint} ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("openai-compatible empty response");
  return text.trim();
}

function buildProviderChain(): Provider[] {
  const chain: Provider[] = [];

  collectKeys("GEMINI_API_KEY").forEach((key, i) =>
    chain.push({
      name: `gemini[${i + 1}]`,
      call: (msgs, opts) => callGemini(key, msgs, opts),
    }),
  );

  collectKeys("GROQ_API_KEY").forEach((key, i) =>
    chain.push({
      name: `groq[${i + 1}]`,
      call: (msgs, opts) =>
        callOpenAICompatible(
          key,
          "https://api.groq.com/openai/v1/chat/completions",
          "llama-3.3-70b-versatile",
          msgs,
          opts,
        ),
    }),
  );

  collectKeys("OPENROUTER_API_KEY").forEach((key, i) =>
    chain.push({
      name: `openrouter[${i + 1}]`,
      call: (msgs, opts) =>
        callOpenAICompatible(
          key,
          "https://openrouter.ai/api/v1/chat/completions",
          "meta-llama/llama-3.3-70b-instruct:free",
          msgs,
          opts,
          {
            "HTTP-Referer": "https://forge.local",
            "X-Title": "FORGE",
          },
        ),
    }),
  );

  return chain;
}

export interface AICallResult {
  text: string;
  provider: string;
  attempts: Array<{ provider: string; error?: string }>;
}

export async function callAI(
  messages: AIMessage[],
  options: AICallOptions = {},
): Promise<AICallResult> {
  const chain = buildProviderChain();
  if (chain.length === 0) {
    throw new Error("AI_NOT_CONFIGURED");
  }
  const attempts: AICallResult["attempts"] = [];
  for (const provider of chain) {
    try {
      const text = await provider.call(messages, options);
      attempts.push({ provider: provider.name });
      return { text, provider: provider.name, attempts };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      attempts.push({ provider: provider.name, error: message });
      // Continue to next provider
    }
  }
  throw new Error(`All ${chain.length} AI providers failed. ${JSON.stringify(attempts)}`);
}

export function isAIConfigured(): boolean {
  return buildProviderChain().length > 0;
}
