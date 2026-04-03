import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/create-child.dto';

@Controller('children')
@UseGuards(JwtAuthGuard)
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Get()
  async getMine(@CurrentUser() user: any) {
    return this.childrenService.getMine(user.id);
  }

  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateChildDto) {
    return this.childrenService.createForParent(user.id, dto);
  }

  @Get(':id')
  async getOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.childrenService.getOneForParent(user.id, id);
  }
}
