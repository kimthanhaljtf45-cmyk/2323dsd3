import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GroupsService } from './groups.service';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  async getAll() {
    return this.groupsService.getAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.groupsService.getById(id);
  }
}
