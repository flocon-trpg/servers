import { Test, TestingModule } from '@nestjs/testing';
import { IndexOkController } from './index-ok.controller';

describe('IndexOkController', () => {
    let controller: IndexOkController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [IndexOkController],
        }).compile();

        controller = module.get<IndexOkController>(IndexOkController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
