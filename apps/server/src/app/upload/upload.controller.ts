import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiOkResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AdminAuth } from '../auth/decorators/admin-auth.decorator';
import { SupabaseService } from '../supabase/supabase.service';

@ApiTags('upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(private supabase: SupabaseService) {}

  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ schema: { properties: { url: { type: 'string' } } } })
  @Post('image')
  @AdminAuth()
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    fileFilter: (_, file, cb) => cb(null, /\.(jpg|jpeg|png|gif|webp)$/i.test(file.originalname)),
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const url = await this.supabase.uploadFile('gallery', file.originalname, file.buffer, file.mimetype);
    return { url };
  }

  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ schema: { properties: { url: { type: 'string' } } } })
  @Post('video')
  @AdminAuth()
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    fileFilter: (_, file, cb) => cb(null, /\.(mp4|webm|ogg|mov)$/i.test(file.originalname)),
    limits: { fileSize: 200 * 1024 * 1024 },
  }))
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    const url = await this.supabase.uploadFile('gallery', file.originalname, file.buffer, file.mimetype);
    return { url };
  }
}
