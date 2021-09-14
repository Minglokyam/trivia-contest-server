import { User } from '../entities/User';
import { Resolver, Arg, Field, Int, Mutation, ObjectType, Query } from 'type-graphql';
import argon2 from 'argon2';
import { getConnection, getManager } from 'typeorm';
import { CredentialOptions } from './CredentialOptions';
import { validateRegister } from '../utils/validateRegister';

@ObjectType()
class FieldError{
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse{
    @Field(() => User, {nullable: true})
    user?: User;

    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[];
}

@Resolver(User)
export class UserResolver{
    @Query(() => [User])
    async users(){
        const usersResult = await getConnection()
        .createQueryBuilder()
        .select('user')
        .from(User, 'user')
        .orderBy('user.points', 'DESC')
        .take(10)
        .getMany();

        return usersResult;
    }

    @Mutation(() => UserResponse)
    async incrementPoint(
        @Arg('id', () => Int) id: number,
        @Arg('incrementPoints', () => Int) incrementPoints: number
    ): Promise<UserResponse>{
        const entityManager = getManager();
        const user = await entityManager.findOne(User, id);

        if(!user){
            return {
                errors: [{
                    field: 'id',
                    message: 'The user does not exist'
                }]
            };;
        }

        user.points += incrementPoints;
        user.updatedAt = new Date().getTime().toString();
        await entityManager.save(user);

        return {user};
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string
    ): Promise<UserResponse>{
        const entityManager = getManager();

        let identifier;
        if(usernameOrEmail.includes('@')){
            identifier = {email: usernameOrEmail}
        }
        else{
            identifier = {username: usernameOrEmail}
        }
        const user = await entityManager.findOne(User, identifier);

        if(!user){
            return {
                errors: [{
                    field: 'usernameOrEmail',
                    message: 'Username or email not exist'
                }]
            };
        }

        const validFlagOfPassword = await argon2.verify(user.password, password);

        if(!validFlagOfPassword){
            return {
                errors: [{
                    field: 'password',
                    message: 'Invalid password'
                }]
            };
        }

        return {user};
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: CredentialOptions
    ): Promise<UserResponse>{
        const errors = validateRegister(options);
        if(errors){
            return {errors};
        }

        const {username, password, email} = options;
        const hashedPassword = await argon2.hash(password);

        let user;
        try{
            const insertResult = await getConnection()
            .createQueryBuilder()
            .insert()
            .into(User)
            .values({
                username,
                email,
                password: hashedPassword
            })
            .returning('*')
            .execute();

            user = insertResult.raw[0];
        }
        catch(error){
            if(error.code === '23505'){
                console.log(error);
                if(error.detail.includes('username')){
                    return {errors: [{
                        field: 'username',
                        message: 'Duplicated username'
                    }]};
                }
                return {errors: [{
                    field: 'email',
                    message: 'Duplicated email'
                }]};
            }
        }

        return {user};
    }
}