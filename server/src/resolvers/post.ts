import { Post } from "../entities/Post";
import { Resolver, Query, Ctx, Arg, Int, Mutation } from "type-graphql";
import { MyContext } from "src/types";
import { RequiredEntityData } from "@mikro-orm/core";

@Resolver()
export class PostResolver {
	@Query(() => [Post])
	posts(@Ctx() { em }: MyContext): Promise<Post[]> {
		const fork = em.fork();
		return fork.find(Post, {});
	}

	@Query(() => Post, { nullable: true })
	post(
		@Arg("id", () => Int) id: number,
		@Ctx() { em }: MyContext
	): Promise<Post | null> {
		const fork = em.fork();
		return fork.findOne(Post, { id });
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

	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Arg("id") id: number,
		@Arg("title") title: string,
		@Ctx() { em }: MyContext
	): Promise<Post> {
		const fork = em.fork();
		const post = await fork.findOne(Post, { id });
		if (!post) return null;

		if (typeof title !== "undefined") {
			post.title = title; 
			await fork.persistAndFlush(post);
		}
		return post;
	}

	@Mutation(() => Boolean)
	async deletePost(
		@Arg("id") id: number,
		@Ctx() { em }: MyContext
	): Promise<boolean> {
		const fork = em.fork();
		await fork.nativeDelete(Post, { id }); 
		return true; 
	}
}
