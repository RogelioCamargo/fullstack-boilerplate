import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";

(async () => {
	const orm = await MikroORM.init(microConfig);
	await orm.getMigrator().up();

	// const generator = orm.getSchemaGenerator();
	// await generator.updateSchema();
	// OR npx mikro-orm schema:create

	const app = express();

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver],
			validate: false,
		}),
		context: () => ({ em: orm.em }),
	});

	await apolloServer.start();
	apolloServer.applyMiddleware({ app });

	app.listen(5000, () => {
		console.log("Server started on localhost:5000");
	});

	// const post = orm.em.create(Post, {
	// 	title: "First Post!",
	// } as RequiredEntityData<Post>);
	// await orm.em.persistAndFlush(post);
})();
