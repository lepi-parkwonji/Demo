import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InquiryModule } from '../inquiry/inquiry.module';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CustomerAuthGuard } from '../auth/guards/customer-auth.guard';

@Module({
  imports: [AuthModule, InquiryModule],
  controllers: [CustomerController],
  providers: [CustomerService, CustomerAuthGuard],
})
export class CustomerModule {}
