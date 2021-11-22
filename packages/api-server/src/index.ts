import 'reflect-metadata';
import { main } from './main';
import { loadAsMain } from './utils/commandLineArgs';

loadAsMain().then(args => {
    main(args).catch(err => console.error(err));
});
