import { Router, type IRouter } from "express";
import { db, conversationsTable, usersTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { SendChatMessageBody } from "@workspace/api-zod";
import { anthropic, CHAT_MODEL } from "../lib/anthropic";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are CareCompanion, a warm, careful AI healthcare assistant.
You help patients understand symptoms in plain language, suggest when to see a doctor, and encourage booking appointments when appropriate.
Rules:
- Be polite, concise, and reassuring. Keep replies under 4 short paragraphs unless the patient asks for detail.
- You are NOT a substitute for a licensed clinician. Never diagnose. Never prescribe. For anything urgent (chest pain, trouble breathing, suicidal thoughts, severe bleeding, stroke symptoms) tell the patient to call emergency services immediately.
- When the patient describes ongoing or worrying symptoms, suggest booking an appointment with an appropriate specialty.
- Do not use emojis.`;

type Suggestion = "book_appointment" | "see_doctor" | "none";

function detectSuggestion(userMessage: string, aiResponse: string): Suggestion {
  const text = `${userMessage} ${aiResponse}`.toLowerCase();
  const symptomWords = [
    "pain", "fever", "cough", "headache", "dizzy", "nausea", "vomit",
    "rash", "bleed", "swell", "ache", "tired", "fatigue", "anxious",
    "depress", "infection", "sore", "injury", "hurt", "sick",
  ];
  const bookingWords = ["book", "appointment", "schedule", "see a doctor", "visit"];
  if (bookingWords.some((w) => aiResponse.toLowerCase().includes(w))) {
    return "book_appointment";
  }
  if (symptomWords.some((w) => text.includes(w))) {
    return "see_doctor";
  }
  return "none";
}

router.post("/chat", async (req, res) => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
  }
  const { userId, message } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) return res.status(404).json({ error: "User not found" });

  const recent = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.userId, userId))
    .orderBy(desc(conversationsTable.createdAt))
    .limit(6);

  const history = recent.reverse();
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [];
  for (const turn of history) {
    messages.push({ role: "user", content: turn.message });
    messages.push({ role: "assistant", content: turn.response });
  }
  messages.push({ role: "user", content: message });

  let aiText = "";
  try {
    const completion = await anthropic.messages.create({
      model: CHAT_MODEL,
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages,
    });
    for (const block of completion.content) {
      if (block.type === "text") aiText += block.text;
    }
    aiText = aiText.trim();
    if (!aiText) {
      aiText = "I'm here to help. Could you tell me a little more about how you are feeling?";
    }
  } catch (err) {
    req.log.error({ err }, "AI chat completion failed");
    return res.status(502).json({ error: "AI assistant is temporarily unavailable" });
  }

  const [saved] = await db
    .insert(conversationsTable)
    .values({ userId, message, response: aiText })
    .returning();

  const suggestion = detectSuggestion(message, aiText);

  return res.json({
    id: saved.id,
    userId: saved.userId,
    message: saved.message,
    response: saved.response,
    suggestion,
    createdAt: saved.createdAt.toISOString(),
  });
});

router.get("/conversations/:userId", async (req, res) => {
  const userId = req.params["userId"]!;
  const rows = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.userId, userId))
    .orderBy(conversationsTable.createdAt);
  return res.json(
    rows.map((c) => ({
      id: c.id,
      userId: c.userId,
      message: c.message,
      response: c.response,
      createdAt: c.createdAt.toISOString(),
    })),
  );
});

export default router;
