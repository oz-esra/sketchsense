import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are an elite frontend developer. A user has drawn a UI wireframe sketch. Analyze it carefully and generate a COMPLETE, working HTML page.

CRITICAL RULES:
1. Output ONLY raw HTML — no markdown, no code fences, no explanation
2. Start with <!DOCTYPE html>
3. Embed ALL CSS in <style> tags and ALL JS in <script> tags
4. Design with a modern, polished aesthetic: use a cohesive color palette, good typography, proper spacing
5. Use Google Fonts (preconnect + link tags included in <head>)
6. Implement EVERY visible UI element: buttons, inputs, navbars, cards, tables, sidebars, etc.
7. Add realistic placeholder content that makes sense for the UI
8. Make it responsive with flexbox/grid
9. Add smooth hover effects and transitions
10. The result should look like a real, production-ready web page`;

export async function generateUI({ apiKey, imageBase64, refinement = "", onChunk, signal }) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.4,
    },
  });

  const parts = [
    { text: SYSTEM_PROMPT },
    { inlineData: { mimeType: "image/png", data: imageBase64 } },
  ];

  if (refinement.trim()) {
    parts.push({ text: `\nAdditional instructions from user: ${refinement}` });
  }

  const result = await model.generateContentStream(parts);

  let fullText = "";
  for await (const chunk of result.stream) {
    if (signal?.aborted) break;
    const chunkText = chunk.text();
    fullText += chunkText;
    if (onChunk) onChunk(cleanCode(fullText));
  }

  return cleanCode(fullText);
}

function cleanCode(text) {
  return text
    .replace(/^```(?:html)?\n?/im, "")
    .replace(/\n?```\s*$/im, "")
    .trim();
}

export async function refineUI({ apiKey, currentCode, refinement, imageBase64, onChunk, signal }) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { maxOutputTokens: 8192, temperature: 0.4 },
  });

  const parts = [
    {
      text: `You are an elite frontend developer. Below is the current HTML code of a web page.\n\nCurrent HTML:\n${currentCode}\n\nUser request: "${refinement}"\n\nApply the requested changes and return the COMPLETE updated HTML. Output ONLY raw HTML, no explanation, no code fences.`,
    },
  ];

  if (imageBase64) {
    parts.push({ inlineData: { mimeType: "image/png", data: imageBase64 } });
  }

  const result = await model.generateContentStream(parts);

  let fullText = "";
  for await (const chunk of result.stream) {
    if (signal?.aborted) break;
    const chunkText = chunk.text();
    fullText += chunkText;
    if (onChunk) onChunk(cleanCode(fullText));
  }

  return cleanCode(fullText);
}
