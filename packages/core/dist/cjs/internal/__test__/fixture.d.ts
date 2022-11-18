import { State, boardTemplate, characterTemplate, roomDbTemplate, roomTemplate } from '../..';
export declare namespace Fixture {
    namespace Participant {
        namespace Spectator {
            const userUid = "SPECTATOR";
            const name: string & import("zod").BRAND<"MaxLength100String">;
        }
        namespace Player1 {
            const userUid = "PLAYER1";
            const name: string & import("zod").BRAND<"MaxLength100String">;
        }
        namespace Player2 {
            const userUid = "PLAYER2";
            const name: string & import("zod").BRAND<"MaxLength100String">;
        }
        namespace Null {
            const userUid = "NULL_PARTICIPANT";
            const name: string & import("zod").BRAND<"MaxLength100String">;
        }
        namespace None {
            const userUid = "NONE_PARTICIPANT";
        }
    }
    namespace Board {
        const emptyState: (ownerParticipantId: string | undefined) => State<typeof boardTemplate>;
    }
    namespace Character {
        const emptyState: (ownerParticipantId: string | undefined) => State<typeof characterTemplate>;
    }
    const minimumState: State<typeof roomTemplate>;
    const complexDbState: State<typeof roomDbTemplate>;
    const complexState: State<typeof roomTemplate>;
}
//# sourceMappingURL=fixture.d.ts.map