import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { buildSchema } from 'type-graphql';
import { createConnections } from 'typeorm';
import { User } from './entities/User';
import { UserResolver } from './resolvers/userResolver';

const main = async () => {
    const app = express();
    const port = 4000;

    await createConnections([{
        url: 'postgres://jilcswurwxfeor:fddc356fc93ae54a393e8745175578d69c05095ebef20d697a86d3f893b1cef6@ec2-52-0-93-3.compute-1.amazonaws.com:5432/dajs9255cl9b0',
        entities: [User],
        type: 'postgres',
        logging: false,
        synchronize: false,
        extra: {
            rejectUnauthorized: false
        }
    }]);
    
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver],
            validate: false
        })
    });

    await apolloServer.start();

    apolloServer.applyMiddleware({app});

    app.listen(port, () => {
        console.log(`The server listening at http://localhost:${port}`)
    });
}

main().catch(error => {
    console.log(error);
});
