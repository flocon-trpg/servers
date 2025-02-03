import { Test, TestingModule } from '@nestjs/testing';
import { IndexErrorController } from './index-error.controller';

describe('IndexErrorController', () => {
    let controller: IndexErrorController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [IndexErrorController],
        }).compile();

        controller = module.get<IndexErrorController>(IndexErrorController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
