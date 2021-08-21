import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { EM } from '../../../utils/types';

@Entity()
export class Singleton {
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @PrimaryKey()
    public id: string = '';

    @Property({ nullable: true })
    public entryPasswordHash?: string;
}

export const getSingletonEntity = async (em: EM): Promise<Singleton> => {
    const entity = await em.findOne(Singleton, { id: '' });
    if (entity != null) {
        return entity;
    }
    const newEntity = new Singleton();
    await em.persistAndFlush(newEntity);
    return newEntity;
};
