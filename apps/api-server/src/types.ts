import { Connection, EntityManager, IDatabaseDriver, MikroORM } from '@mikro-orm/core';

export type EM = EntityManager<IDatabaseDriver<Connection>>;
export type ORM = MikroORM<IDatabaseDriver<Connection>>;
