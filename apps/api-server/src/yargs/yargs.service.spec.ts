import { Test, TestingModule } from '@nestjs/testing';
import { YargsService } from './yargs.service';

describe('YargsService', () => {
    let service: YargsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [YargsService],
        }).compile();

        service = module.get<YargsService>(YargsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
