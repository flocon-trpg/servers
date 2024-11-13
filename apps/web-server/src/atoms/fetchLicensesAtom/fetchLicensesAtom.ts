import { createFetchAtom } from '../createFetchAtom/createFetchAtom';

export const licensesFileName = 'licenses.md';

export const fetchLicensesAtom = createFetchAtom(`/${licensesFileName}`);
