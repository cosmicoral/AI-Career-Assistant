import OpenAI from "openai";
import { z } from "zod";
import { env, isOpenAiConfigured, requireOpenAiConfig } from "../config/env";

let client: OpenAI | null = null;

function getClient() {
  requireOpenAiConfig();

  if (!client) {
    client = new OpenAI({
      apiKey: env.OPENAI_API_KEY
    });
  }

  return client;
}

export async function generateStructuredObject<T>(
  params: {
    system: string;
    user: string;
    schema: z.ZodSchema<T>;
    mock?: () => T | Promise<T>;
    temperature?: number;
  }
): Promise<T> {
  if (!isOpenAiConfigured && env.NODE_ENV !== "production" && params.mock) {
    return params.schema.parse(await params.mock());
  }

  const completion = await getClient().chat.completions.create({
    model: env.OPENAI_MODEL || "gpt-4.1-mini",
    temperature: params.temperature ?? 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: params.system
      },
      {
        role: "user",
        content: params.user
      }
    ]
  });

  const content = completion.choices[0]?.message.content;

  if (!content) {
    throw Object.assign(new Error("AI response was empty."), { statusCode: 502 });
  }

  try {
    return params.schema.parse(JSON.parse(content));
  } catch (error) {
    throw Object.assign(new Error("AI response did not match the expected schema."), {
      statusCode: 502,
      cause: error
    });
  }
}
