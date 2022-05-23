import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { Channel, PrismaClient } from "@prisma/client";

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
		if (req.method === "GET") {
			const data = await prisma.channel.findMany({
				where: {
					guildId: +guild_id,
				},
			});
			if (data) {
				res.status(200).json(data);
			} else {
				res.status(400).json({ message: "Guild_id was not valid." });
			}
		} else if (req.method === "POST") {
			if (req.body.name) {
				const data = await prisma.channel.findMany({
					where: {
						guildId: Number(guild_id),
					},
					select: {
						position: true,
					},
					orderBy: {
						position: "desc",
					},
					take: 1,
				});
				await prisma.channel.create({
					data: {
						guildId: Number(guild_id),
						name: req.body.name,
						position:
							(data[0]?.position ? data[0]?.position : 0) + 1,
						type: "textChannel",
					},
				});
				res.status(205).end();
			} else {
				res.status(400).json({
					message: "Message invalid.",
				});
			}
		} else if (req.method === "PATCH") {
			// check permissions
			// channel exists with try catch?
			// get position and channel id
			if (req.body.position && req.body.id) {
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
				// 0x2 Admin
				// 0x4 MANAGE_CHANNELS
				if (
					member &&
					((member?.permissions & 0x4) === 0x4 ||
						(member?.permissions & 0x2) === 0x2)
				) {
					const channel = await prisma.channel.findUnique({
						where: {
							id: req.body.id,
						},
					});
					if (
						channel &&
						channel.position &&
						req.body.position - channel.position > 0
					) {
						// condition: the position the channel is going to is greater (down) than original
						// checks for any channels after original channel, and before or equal to the position it is going to
						// await prisma.channel.update({
						//     where: {
						//         id: req.body.id
						//     },
						//     data: {
						//         position: req.body.position+Math.floor(Math.random() * 100) / 100
						//     }
						// });
						const updated = await prisma.$transaction([
							prisma.channel.findMany({
								where: {
									position: {
										lt: req.body.position + 1,
										gt: channel.position,
									},
								},
								select: {
									guildId: true,
									position: true,
									parentId: true,
									createdAt: true,
									ratelimit: true,
									id: true,
									type: true,
									name: true,
									description: true,
								},
							}),
							prisma.channel.updateMany({
								where: {
									position: {
										lt: req.body.position + 1,
										gt: channel.position,
									},
								},
								data: {
									position: {
										decrement: 1,
									},
								},
							}),
							prisma.channel.update({
								where: {
									id: req.body.id,
								},
								data: {
									position: req.body.position,
								},
							}),
						]);
						res.status(204).end();
						// Array of updated channel objects
						[
							...updated[0].map((item) => ({
								...item,
								position: (item?.position || 1) - 1,
							})),
							updated[2],
						];
					} else if (
						channel &&
						channel.position &&
						req.body.position - channel.position < 0
					) {
						// condition: the position the channel is going to is less (above) than original
						// checks for any channels before original channel, and after or equal to the position it is going to
						// await prisma.channel.update({
						//     where: {
						//         id: channel.id
						//     },
						//     data: {
						//         position: req.body.position + Math.floor(Math.random() * 100) / 100
						//     }
						// });
						const updated = await prisma.$transaction([
							prisma.channel.findMany({
								where: {
									position: {
										lt: channel.position,
										gt: req.body.position - 1,
									},
								},
								select: {
									guildId: true,
									position: true,
									parentId: true,
									createdAt: true,
									ratelimit: true,
									id: true,
									type: true,
									name: true,
									description: true,
								},
							}),
							prisma.channel.updateMany({
								where: {
									position: {
										lt: channel.position,
										gt: req.body.position - 1,
									},
								},
								data: {
									position: {
										increment: 1,
									},
								},
							}),
							prisma.channel.update({
								where: {
									id: channel.id,
								},
								data: {
									position: req.body.position,
								},
							}),
						]);
						res.status(205).end();
						// send json
						[
							...updated[0].map(
								(item: Channel): Channel => ({
									...item,
									position: (item.position || 1) - 1,
								})
							),
							updated[2],
						];
					} else {
						res.status(400).json({
							message: "Invalid position or channel",
						});
					}
				} else {
					res.status(403).json({
						message:
							"Member or channel was not found or missing permissions",
					});
				}
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
