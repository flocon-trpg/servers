import 'reflect-metadata';
import main from './main';
import { loadAsMain } from './utils/commandLineArgs';

main({ debug: loadAsMain().debug }).catch(err => console.error(err));