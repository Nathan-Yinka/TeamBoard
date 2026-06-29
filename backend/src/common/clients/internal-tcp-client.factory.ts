import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { AppEnvironment } from '../../config/env.schema';

@Injectable()
export class InternalTcpClientFactory {
  constructor(private readonly configService: ConfigService<AppEnvironment, true>) {}

  createClient(): ClientProxy {
    return ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: this.configService.get('microserviceHost', { infer: true }),
        port: this.configService.get('microservicePort', { infer: true })
      }
    });
  }
}
