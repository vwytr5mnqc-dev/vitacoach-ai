import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import OpenAI from 'openai';

@Injectable()
export class AppService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  // --- COACHES & CLIENTS (Ya los tenías) ---
  async createCoach(data: { email: string; orgName: string }) {
    return this.prisma.coach.create({
      data: { email: data.email, password: "demo", orgName: data.orgName },
    });
  }

  async getCoaches() {
    return this.prisma.coach.findMany({ include: { clients: true } });
  }

  async createClient(data: { coachId: string; name: string; email: string; goal: string }) {
    return this.prisma.client.create({
      data: { coachId: data.coachId, name: data.name, email: data.email, goal: data.goal },
    });
  }

  async getClientsByCoach(coachId: string) {
    return this.prisma.client.findMany({
      where: { coachId: coachId },
      orderBy: { createdAt: 'desc' },
      include: { plans: true } // Traemos sus planes también
    });
  }

  // --- NUEVO: GENERADOR DE PLANES CON IA (TPG + NPG) 🤖 ---
  async generatePlan(data: { clientId: string; weeks: number; focus: string }) {
    // 1. Buscamos datos del cliente para darle contexto a la IA
    const client = await this.prisma.client.findUnique({ where: { id: data.clientId } });
    if (!client) throw new Error("Cliente no encontrado");

    // 2. Prompt de Ingeniería (Siguiendo el documento fundador)
    const prompt = `
      Actúa como un Coach experto. Genera un plan de entrenamiento de ${data.weeks} semanas enfocado en ${data.focus} para un cliente llamado ${client.name} con objetivo ${client.goal}.
      
      IMPORTANTE: Responde SOLO con un objeto JSON válido (sin texto extra) con esta estructura exacta:
      {
        "training": [
          { "day": "Lunes", "focus": "Pecho/Triceps", "exercises": ["Press Banca 4x10", "Aperturas 3x12"] }
        ],
        "nutrition": {
          "calories": 2500,
          "macros": "40% Prot, 40% Carb, 20% Grasa",
          "example_meal": "Pollo con arroz y brócoli"
        },
        "reasoning": "Se prioriza volumen por su objetivo de hipertrofia."
      }
    `;

    const completion = await this.openai.chat.completions.create({
      messages: [{ role: "system", content: "Eres una API que solo responde JSON." }, { role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    // 3. Parseamos la respuesta de la IA
    const aiResponse = completion.choices[0].message.content || "{}";
    const planData = JSON.parse(aiResponse);

    // 4. Guardamos en la Base de Datos (Tabla 'Plan')
    return this.prisma.plan.create({
      data: {
        clientId: data.clientId,
        weeks: data.weeks,
        focus: data.focus,
        status: "draft",
        blocks: planData, // Guardamos todo el JSON que nos dio la IA
      },
    });
  }
}