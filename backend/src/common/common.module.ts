import { Module } from '@nestjs/common';
import { InternalTcpClientFactory } from './clients/internal-tcp-client.factory';

@Module({
  providers: [InternalTcpClientFactory],
  exports: [InternalTcpClientFactory]
})
export class CommonModule {}
