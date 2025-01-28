import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { WebServerConfigService } from './web-server-config.service';

const setup = async (envMock: Record<string, string>) => {
    const module: TestingModule = await Test.createTestingModule({
        imports: [ConfigModule.forRoot({ envFilePath: [], load: [() => envMock] })],
        providers: [WebServerConfigService],
    }).compile();

    return module.get(WebServerConfigService);
};

describe('WebServerConfigService', () => {
    it('should be defined', async () => {
        const service = await setup({});
        expect(service).toBeDefined();
    });
});
