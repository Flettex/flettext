import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function Get(req: NextApiRequest, res: NextApiResponse) {
	if (!req.headers.authorization) {
		res.status(400).json({
			message: "Bad Request. No authorization header provided",
		});
		return;
	}
	try {
		const user: any = jwt.verify(
			req.headers.authorization,
			process.env.SECRET_JWT as string
		);
		const { guild_id } = req.query;
		const data = await prisma.guild.findUnique({
			where: {
				id: Number(guild_id),
			},
		});
		if (req.method === "GET") {
			if (data) {
				res.status(200).json(data);
			} else {
				res.status(406).json({ message: "Guild Id not acceptable" });
			}
		} else if (req.method === "PATCH") {
			// you can only update name at the moment
			if (
				(req.body.name && req.body.name.length > 0) ||
				req.body.owner_id
			) {
				const member = await prisma.member.findUnique({
					where: {
						user_unique_per_guild_constraint: {
							userId: user.id,
							guildId: Number(guild_id),
						},
					},
					select: {
						permissions: true,
					},
				});
				// 0x1 is manage_guilds
				// 0x2 is administrator
				if (
					(member &&
						((member?.permissions & 0x1) === 0x1 ||
							(member?.permissions & 0x2) === 0x2)) ||
					(req.body.owner_id && user.id === data?.ownerId)
				) {
					if (req.body.owner_id) {
						const updatedGuild = await prisma.guild.update({
							where: {
								id: Number(guild_id),
							},
							data: {
								ownerId: req.body.owner_id,
							},
						});
						res.status(200).json(updatedGuild);
					} else {
						const updatedGuild = await prisma.guild.update({
							where: {
								id: Number(guild_id),
							},
							data: {
								name: req.body.name || null,
							},
						});
						res.status(200).json(updatedGuild);
					}
				} else {
					res.status(403).json({
						message: "Member was not found or missing permissions",
					});
				}
			} else {
				res.status(400).json({
					message: "Not enough body parameters or invalid",
				});
			}
		} else if (req.method === "DELETE") {
			if (user.id === data?.ownerId) {
				await prisma.guild.delete({
					where: {
						id: Number(guild_id),
					},
				});
				res.status(204).end();
			} else {
				res.status(403).json({
					message: "Member was not found or missing permissions",
				});
			}
		} else {
			res.status(405).json({ message: "Method not allowed." });
		}
	} catch (err: any) {
		res.status(400).json({
			message: err.message,
		});
	}
}
