import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Coaches
  @Post('coaches')
  createCoach(@Body() body: { email: string; orgName: string }) { return this.appService.createCoach(body); }
  
  // Clients
  @Post('clients')
  createClient(@Body() body: { coachId: string; name: string; email: string; goal: string }) { return this.appService.createClient(body); }

  @Get('clients/:coachId')
  getClients(@Param('coachId') coachId: string) { return this.appService.getClientsByCoach(coachId); }

  // NUEVO: Generar Plan ⚡️
  @Post('plans/generate')
  generatePlan(@Body() body: { clientId: string; weeks: number; focus: string }) {
    return this.appService.generatePlan(body);
  }
}