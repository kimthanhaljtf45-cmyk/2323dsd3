import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LocationsService } from './locations.service';

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async getAll() {
    return this.locationsService.getAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.locationsService.getById(id);
  }
}
