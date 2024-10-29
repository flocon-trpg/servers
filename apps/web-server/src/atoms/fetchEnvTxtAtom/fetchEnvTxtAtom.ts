import { createFetchAtom } from '../createFetchAtom/createFetchAtom';

export const envTxtFileName = 'env.txt';

export const fetchEnvTxtAtom = createFetchAtom(`/${envTxtFileName}`);
