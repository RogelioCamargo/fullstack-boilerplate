import { MyContext } from "src/types";
import { Resolver, Mutation, Arg, InputType, Field, Ctx } from "type-graphql";
import { User } from "../entities/User";
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput {
	@Field()
	username: string;
	@Field()
	password: string;
}

@Resolver()
export class UserResolver {
	@Mutation(() => User)
	async register(
		@Arg("options") options: UsernamePasswordInput,
		@Ctx() { em }: MyContext
	) {
		const fork = em.fork();
		const hashedPassword = await argon2.hash(options.password);
		const user = fork.create(User, {
			username: options.username,
			password: hashedPassword,
		});
		await fork.persistAndFlush(user);
		return user;
	}
}
