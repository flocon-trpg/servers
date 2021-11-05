import * as t from 'io-ts';

export const record = <TDomain extends t.Mixed, TCodomain extends t.Mixed>(
    domain: TDomain,
    codomain: TCodomain
) => t.record(domain, t.union([codomain, t.undefined]));
