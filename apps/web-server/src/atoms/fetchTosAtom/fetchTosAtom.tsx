import { createFetchAtom } from '../createFetchAtom/createFetchAtom';

export const tosFileName = 'tos.md';

export const fetchTosAtom = createFetchAtom(`/${tosFileName}`);
