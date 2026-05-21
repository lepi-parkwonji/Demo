import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;

  constructor(private config: ConfigService) {
    this.client = createClient(
      this.config.getOrThrow('SUPABASE_URL'),
      this.config.getOrThrow('SUPABASE_SERVICE_KEY'),
    );
  }

  async uploadFile(bucket: string, filename: string, buffer: Buffer, mimetype: string): Promise<string> {
    const ext = filename.split('.').pop()?.toLowerCase() ?? 'bin';
    const path = `${Date.now()}.${ext}`;
    const { error } = await this.client.storage.from(bucket).upload(path, buffer, { contentType: mimetype, upsert: true });
    if (error) throw new Error(`Supabase upload failed: ${error.message}`);
    const { data } = this.client.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
