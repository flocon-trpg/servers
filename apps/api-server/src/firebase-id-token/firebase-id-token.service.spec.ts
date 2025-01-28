import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseIdTokenService } from './firebase-id-token.service';

describe('FirebaseidTokenService', () => {
    let service: FirebaseIdTokenService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [FirebaseIdTokenService],
        }).compile();

        service = module.get<FirebaseIdTokenService>(FirebaseIdTokenService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
