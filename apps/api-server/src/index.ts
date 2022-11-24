import { loggerRef } from '@flocon-trpg/utils';
import 'reflect-metadata';
import { main } from './main';
import { loadAsMain } from './utils/commandLineArgs';

loadAsMain().then(args => {
    main(args).catch(err => loggerRef.value.error(err));
});
