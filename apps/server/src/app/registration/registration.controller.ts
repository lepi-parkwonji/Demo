import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { AdminAuth } from '../auth/decorators/admin-auth.decorator';
import { ApiPaginatedResponse } from '../../libs/swagger/api-paginated-response.decorator';
import { ApiSearchQuery } from '../../libs/swagger/api-search-query.decorator';
import { CreateRegistrationDTO } from './dtos/create-registration.dto';
import { UpdateRegistrationDTO } from './dtos/update-registration.dto';
import { RegistrationResponseDTO } from './dtos/registration-response.dto';
import { RegistrationSearchOptionDTO } from './dtos/registration-search-option.dto';
import { RegistrationService } from './registration.service';

@ApiTags('registration')
@ApiBearerAuth()
@Controller('registration')
export class RegistrationController {
  constructor(private registrationService: RegistrationService) {}

  @ApiPaginatedResponse(RegistrationResponseDTO) @ApiSearchQuery()
  @Get('search')
  @AdminAuth()
  search(@Query() dto: RegistrationSearchOptionDTO) {
    return this.registrationService.search(dto);
  }

  @ApiOkResponse({ type: RegistrationResponseDTO }) @ApiBody({ type: CreateRegistrationDTO })
  @Post()
  @AdminAuth()
  create(@Body() dto: CreateRegistrationDTO) {
    return this.registrationService.create(dto);
  }

  @ApiOkResponse({ type: RegistrationResponseDTO }) @ApiParam({ name: 'id', type: Number })
  @Get(':id')
  @AdminAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.registrationService.findOne(id);
  }

  @ApiOkResponse({ type: RegistrationResponseDTO }) @ApiBody({ type: UpdateRegistrationDTO }) @ApiParam({ name: 'id', type: Number })
  @Patch(':id')
  @AdminAuth()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRegistrationDTO) {
    return this.registrationService.update(id, dto);
  }

  @ApiOkResponse({ type: RegistrationResponseDTO }) @ApiParam({ name: 'id', type: Number })
  @Delete(':id')
  @AdminAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.registrationService.remove(id);
  }
}
