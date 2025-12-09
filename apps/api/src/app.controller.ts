import { Body, Controller, Get, Post, Delete, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Post()
  createUser(@Body() body: { email: string; name: string }) {
    return this.appService.createUser(body);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.appService.deleteUser(Number(id));
  }
}