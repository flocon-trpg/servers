import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { PrereleaseType } from '../../enums/PrereleaseType';

@ObjectType()
@InputType('PrereleaseInput')
export class Prerelease {
    @Field(() => PrereleaseType)
    public type!: PrereleaseType;

    @Field()
    public version!: number;
}

@ObjectType()
@InputType('SemVerInput')
export class SemVer {
    @Field()
    public major!: number;

    @Field()
    public minor!: number;

    @Field()
    public patch!: number;

    @Field({ nullable: true })
    public prerelease?: Prerelease;
}

@ObjectType()
export class ServerInfo {
    @Field(() => SemVer)
    public version!: SemVer;

    @Field()
    public uploaderEnabled!: boolean;
}
