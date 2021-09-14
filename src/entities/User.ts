import { Field, ObjectType } from 'type-graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class User{
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: string;

    @Field(() => String)
    @Column({type: 'text', default: new Date(new Date().setDate(new Date().getDate() - 1)).getTime().toString()})
    updatedAt: string;

    @Field()
    @Column({unique: true})
    username!: string;

    @Field()
    @Column({unique: true})
    email!: string;

    @Column()
    password!: string;

    @Field()
    @Column({type: 'int', default: 0})
    points: number;
}