import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import OpenAI from 'openai';

@Injectable()
export class AppService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // 1. LEER (Get)
  async getHello() {
    return this.prisma.user.findMany({
      orderBy: { id: 'desc' },
    });
  }

  // 2. CREAR (Post + IA)
  async createUser(data: { email: string; name: string }) {
    const completion = await this.openai.chat.completions.create({
      messages: [
        { role: "system", content: "Eres un nutriólogo experto. Responde solo con el plan." },
        { role: "user", content: `Genera una dieta de 1 día muy breve para ${data.name}.` }
      ],
      model: "gpt-3.5-turbo",
    });

    const dietPlan = completion.choices[0].message.content;

    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        diet: dietPlan,
      },
    });
  }

  // 3. BORRAR (Delete) - ¡Aquí estaba el problema antes!
  async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { id: Number(id) },
    });
  }
}