import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PortConfigService } from './port-config.service';

describe('PortConfigService', () => {
    const setup = async (envMock: Record<string, string>) => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule.forRoot({ envFilePath: [], load: [() => envMock] })],
            providers: [PortConfigService],
        }).compile();

        return module.get(PortConfigService);
    };

    it('should be defined', async () => {
        const service = await setup({ PORT: '3000' });
        expect(service).toBeDefined();
    });
});
