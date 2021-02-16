import { Field, InputType } from 'type-graphql';
import { FilePathInput } from '../FilePathInput';

@InputType()
export class ImageInput {
    @Field({ nullable: true })
    public imagePath?: FilePathInput;

    @Field({ nullable: true })
    public imageCropLeft?: number;

    @Field({ nullable: true })
    public imageCropTop?: number;

    @Field({ nullable: true })
    public imageCropRight?: number;

    @Field({ nullable: true })
    public imageCropBottom?: number;

    @Field({ nullable: true })
    public zoom?: number;
}