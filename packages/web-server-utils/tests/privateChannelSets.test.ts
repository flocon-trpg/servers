import fc from 'fast-check';
import { PrivateChannelSet, PrivateChannelSets } from '../src';
import { expectPrivateChannels } from './expect';

it('tests PrivateChannelSets', () => {
    fc.assert(
        fc.property(
            fc.array(
                fc.record({
                    useSet: fc.boolean(),
                    userUids: fc.array(
                        fc
                            .string({ minLength: 5, maxLength: 15 })
                            .filter(str => /^[a-zA-Z0-9-]+$/.test(str))
                    ),
                })
            ),
            source => {
                const sets = new PrivateChannelSets();
                const userUidsArray: string[][] = [];
                source.forEach(({ userUids, useSet }) => {
                    userUidsArray.push(userUids);
                    if (useSet) {
                        const set = new PrivateChannelSet(userUids);
                        sets.add(set);
                    } else {
                        sets.add(userUids);
                    }
                });

                expectPrivateChannels(sets).toEqual(userUidsArray);
                expectPrivateChannels(sets.clone()).toEqual(userUidsArray);
                const CloneByString = new PrivateChannelSets(sets.toString());
                expectPrivateChannels(CloneByString).toEqual(userUidsArray);
            }
        )
    );
});
