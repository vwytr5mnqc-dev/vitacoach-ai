import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import OpenAI from 'openai';

@Injectable()
export class AppService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    // Inicializamos la conexión con OpenAI usando tu clave guardada
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // 1. Leer usuarios (Ordenados por el más nuevo primero)
  async getHello() {
    return this.prisma.user.findMany({
      orderBy: { id: 'desc' }, 
    });
  }

  // 2. Crear Usuario + IA REAL 🧠
  async createUser(data: { email: string; name: string }) {
    // A. Preguntamos a ChatGPT
    const completion = await this.openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "Eres un nutriólogo experto. Responde solo con el plan de comida, sin saludos." 
        },
        { 
          role: "user", 
          content: `Genera una dieta de 1 día (desayuno, comida, cena), muy breve y saludable (máximo 20 palabras por comida) para ${data.name}.` 
        }
      ],
      model: "gpt-3.5-turbo", // Usamos el modelo rápido y barato
    });

    const dietPlan = completion.choices[0].message.content;

    // B. Guardamos en la base de datos
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        diet: dietPlan,
      },
    });
  }
}