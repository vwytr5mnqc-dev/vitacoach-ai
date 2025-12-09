import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import OpenAI from 'openai';

@Injectable()
export class AppService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  // --- INFRAESTRUCTURA BASE ---

  async createCoach(data: { email: string; orgName: string }) {
    return this.prisma.coach.create({
      data: { email: data.email, password: "admin", orgName: data.orgName },
    });
  }

  async getCoaches() { return this.prisma.coach.findMany({ include: { clients: true } }); }

  async createClient(data: any) {
    return this.prisma.client.create({
      data: {
        coachId: data.coachId,
        name: data.name,
        email: data.email,
        goal: data.goal,
        age: Number(data.age),
        weight: Number(data.weight),
        height: Number(data.height),
        gender: data.gender,
        activityLevel: data.activityLevel,
        injuries: data.injuries,
        equipment: data.equipment
      },
    });
  }

  async getClientsByCoach(coachId: string) {
    return this.prisma.client.findMany({
      where: { coachId: coachId },
      orderBy: { createdAt: 'desc' },
      include: { plans: true }
    });
  }

  // --- 🔥 EL GENERADOR "HEAVY DUTY" (Versión GPT-4o-mini) ---

  async generatePlan(data: { clientId: string; weeks: number; focus: string }) {
    // 1. Validar Cliente
    const client = await this.prisma.client.findUnique({ where: { id: data.clientId } });
    if (!client) throw new Error("Cliente no encontrado");

    // 2. Protocolo de Seguridad Médica
    const safetyProtocol = client.injuries && client.injuries.length > 2
      ? `🚨 LESIÓN REPORTADA: "${client.injuries}". EXCLUIR ejercicios peligrosos para esta zona.`
      : "Atleta sano. Aplicar intensidad completa.";

    // 3. Prompt de Ingeniería
    const prompt = `
      Actúa como Entrenador Olímpico. Diseña un Mesociclo de ${data.weeks} semanas para:
      ${client.name}, ${client.age} años, ${client.weight}kg, Objetivo: ${client.goal} (${data.focus}).
      Equipo: ${client.equipment}. ${safetyProtocol}

      REGLAS OBLIGATORIAS:
      1. Genera MÍNIMO 4 DÍAS por semana.
      2. MÍNIMO 5 ejercicios por sesión.
      3. Variables: RPE, Tempo, Descanso.
      
      Responde SOLO JSON válido con esta estructura:
      {
        "overview": { "mesocycle_goal": "...", "scientific_rationale": "..." },
        "weeks": [
          {
            "week_number": 1,
            "theme": "Acumulación",
            "days": [
              {
                "day_name": "Día 1",
                "exercises": [
                   { "name": "Ejemplo", "sets": 3, "reps": "10", "rpe": "7", "tempo": "2-0-1", "rest": "60s", "notes": "..." }
                ]
              }
            ]
          }
        ],
        "nutrition": { "calories": 2500, "macros": { "protein": "...", "carbs": "...", "fats": "..." }, "guidelines": "..." }
      }
    `;

    // 4. Llamada a OpenAI (USANDO MODELO SUPERIOR)
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini", // <--- AQUÍ ESTÁ EL CAMBIO CLAVE 🚀
      temperature: 0.4,
      messages: [
        { role: "system", content: "Eres una API experta que solo responde JSON RFC8259 válido, sin bloques de código markdown." },
        { role: "user", content: prompt }
      ]
    });

    // 5. Limpieza Inteligente
    const aiResponse = completion.choices[0].message.content || "{}";
    const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let planData;
    try {
      planData = JSON.parse(cleanJson);
      if(!planData.weeks || planData.weeks.length === 0) throw new Error("JSON vacío");
    } catch (e) {
      console.error("❌ Error IA:", e);
      console.log("Respuesta recibida:", cleanJson); // Para depurar en terminal
      
      // Fallback
      planData = {
        overview: { mesocycle_goal: "Error de Formato", scientific_rationale: "La IA generó una respuesta no válida. Revisa la consola del servidor." },
        weeks: [],
        nutrition: { calories: 0, macros: { protein: "-", carbs: "-", fats: "-" }, guidelines: "" }
      };
    }

    return this.prisma.plan.create({
      data: {
        clientId: data.clientId,
        weeks: data.weeks,
        focus: data.focus,
        status: "active",
        blocks: planData,
      },
    });
  }
}