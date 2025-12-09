import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Coaches
  @Post('coaches')
  createCoach(@Body() body: { email: string; orgName: string }) {
    return this.appService.createCoach(body);
  }
  
  @Get('coaches')
  getCoaches() {
    return this.appService.getCoaches();
  }

  // Clients (AQUI ESTABA EL ERROR)
  // Ahora usamos 'any' para aceptar edad, peso, lesiones, etc. sin problemas
  @Post('clients')
  createClient(@Body() body: any) { 
    return this.appService.createClient(body); 
  }

  @Get('clients/:coachId')
  getClients(@Param('coachId') coachId: string) {
    return this.appService.getClientsByCoach(coachId); 
  }

  // Generar Plan IA
  @Post('plans/generate')
  generatePlan(@Body() body: { clientId: string; weeks: number; focus: string }) {
    return this.appService.generatePlan(body);
  }
}