import { MyContext } from "src/types";
import {
	Resolver,
	Mutation,
	Arg,
	InputType,
	Field,
	Ctx,
	ObjectType,
} from "type-graphql";
import { User } from "../entities/User";
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput {
	@Field()
	username: string;
	@Field()
	password: string;
}

@ObjectType()
class FieldError {
	@Field()
	field: string;

	@Field()
	message: string;
}

@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => User, { nullable: true })
	user?: User;
}

@Resolver()
export class UserResolver {
	@Mutation(() => UserResponse)
	async register(
		@Arg("options") options: UsernamePasswordInput,
		@Ctx() { em }: MyContext
	): Promise<UserResponse> {
		const fork = em.fork();
		if (options.username.length <= 3) {
			return {
				errors: [
					{
						field: "username",
						message: "lenth must be greater than 3",
					},
				],
			};
		}

		if (options.password.length <= 3) {
			return {
				errors: [
					{
						field: "password",
						message: "length must be greater than 3",
					},
				],
			};
		}
		const hashedPassword = await argon2.hash(options.password);
		const user = fork.create(User, {
			username: options.username,
			password: hashedPassword,
		});
		await fork.persistAndFlush(user);
		return { user };
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg("options") options: UsernamePasswordInput,
		@Ctx() { em }: MyContext
	): Promise<UserResponse> {
		const fork = em.fork();
		const user = await fork.findOne(User, {
			username: options.username,
		});
		if (!user) {
			return {
				errors: [
					{
						field: "username",
						message: "username does not exist",
					},
				],
			};
		}
		const valid = await argon2.verify(user.password, options.password);

		if (!valid) {
			return {
				errors: [{ field: "password", message: "password is not correct" }],
			};
		}
		return { user };
	}
}
