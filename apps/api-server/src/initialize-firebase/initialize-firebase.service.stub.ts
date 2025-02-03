import { Result } from '@kizahasi/result';
import { InitializeFirebaseService } from './initialize-firebase.service';

export class InitializeFirebaseServiceStub
    implements Pick<InitializeFirebaseService, 'initialize'>
{
    public async initialize(): Promise<Result<void>> {
        return Result.ok(undefined);
    }
}
