import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Post() // <--- Esta es la ventanilla para CREAR
  createUser(@Body() body: { email: string; name: string }) {
    return this.appService.createUser(body);
  }
}