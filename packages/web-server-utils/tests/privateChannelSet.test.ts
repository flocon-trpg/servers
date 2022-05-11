import fc from 'fast-check';
import { PrivateChannelSet } from '../src';

it('tests PrivateChannelSet', () => {
    fc.assert(
        fc.property(
            fc.array(
                fc
                    .string({ minLength: 5, maxLength: 15 })
                    .filter(str => /^[a-zA-Z0-9-]+$/.test(str))
            ),
            userUids => {
                const set = new PrivateChannelSet(userUids);
                expect([...set.toStringArray()].sort()).toEqual([...new Set(userUids)].sort());
                expect(set.toStringSet()).toEqual(new Set(userUids));

                const CloneByArray = new PrivateChannelSet(set.toStringArray());
                expect(CloneByArray.toStringArray()).toEqual(set.toStringArray());
                expect(CloneByArray.toStringSet()).toEqual(set.toStringSet());
                expect(CloneByArray.toString()).toBe(set.toString());

                const CloneBySet = new PrivateChannelSet(set.toStringSet());
                expect(CloneBySet.toStringArray()).toEqual(set.toStringArray());
                expect(CloneBySet.toStringSet()).toEqual(set.toStringSet());
                expect(CloneBySet.toString()).toBe(set.toString());

                const CloneByString = new PrivateChannelSet(set.toString());
                expect(CloneByString.toStringArray()).toEqual(set.toStringArray());
                expect(CloneByString.toStringSet()).toEqual(set.toStringSet());
                expect(CloneByString.toString()).toBe(set.toString());
            }
        )
    );
});
