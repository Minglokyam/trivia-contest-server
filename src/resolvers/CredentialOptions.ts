import { Field, InputType } from 'type-graphql';

@InputType()
export class CredentialOptions {
    @Field()
    username: string;

    @Field()
    password: string;

    @Field()
    email: string;
}