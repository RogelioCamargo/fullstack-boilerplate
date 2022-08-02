import { Post } from "../entities/Post";
import { Resolver, Query, Ctx, Arg, Int, Mutation } from "type-graphql";
import { MyContext } from "src/types";
import { RequiredEntityData } from "@mikro-orm/core";

@Resolver()
export class PostResolver {
	@Query(() => [Post])
	posts(@Ctx() { em }: MyContext): Promise<Post[]> {
		return em.find(Post, {});
	}

	@Query(() => Post, { nullable: true })
	post(
		@Arg("id", () => Int) id: number,
		@Ctx() { em }: MyContext
	): Promise<Post | null> {
		return em.findOne(Post, { id });
	}

	@Mutation(() => Post)
	async createPost(
		@Arg("title") title: string, 
		@Ctx() { em }: MyContext
	): Promise<Post> {
		const fork = em.fork();
		const post = fork.create(Post, { title } as RequiredEntityData<Post>); 
		await fork.persistAndFlush(post); 
		return post; 
	}
}
