
import { GoogleGenAI } from "@google/genai";
import { UserConfig, ShiftType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getShiftInsights = async (config: UserConfig) => {
  const rotationStr = config.rotation.map((w, i) => `Semana ${i + 1}: ${w.shiftType}`).join(", ");
  const prompt = `
    Basado en el siguiente patrón de turnos rotativos: ${rotationStr}.
    El ciclo comienza el ${config.startDate}.
    Proporciona 3 consejos breves y amigables sobre salud y organización para este trabajador.
    Enfócate en el sueño, alimentación o vida social.
    Responde en español, tono motivador y corto.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching insights:", error);
    return "Mantente hidratado y descansa bien entre turnos.";
  }
};
