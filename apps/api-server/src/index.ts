import { loggerRef } from '@flocon-trpg/utils';
import 'reflect-metadata';
import { main } from './main';
import { loadAsMain } from './utils/commandLineArgs';

void loadAsMain().then(args => {
    main(args).catch((err: Error) => loggerRef.error(err));
});
