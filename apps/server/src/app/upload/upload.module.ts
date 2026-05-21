import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { UploadController } from './upload.controller';

@Module({
  imports: [AuthModule, SupabaseModule],
  controllers: [UploadController],
})
export class UploadModule {}
