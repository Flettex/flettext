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
		jwt.verify(
			req.headers.authorization,
			process.env.SECRET_JWT as string
		);
		const { guild_id, role_id } = req.query;
		if (req.method === "GET") {
			const roles = await prisma.role.findMany({
                where: {
                    guildId: +guild_id
                },
				select: {
					guild: true,
					name: true,
					permission: true,
					id: true,
					mentionable: true,
					display: true
				}
            });
			if (roles) {
				res.status(200).json(roles);
			} else {
				res.status(400).json({message: "Role not found."})
			}
		} else if (req.method === "POST" ) {
			if (req.body.name) {
				const role = await prisma.role.create({
					data: {
						guildId: +guild_id,
						name: req.body.name,
						permission: req.body.permission || 0x0,
						mentionable: req.body.mentionable || undefined,
						display: req.body.display || undefined,
					}
				});
				res.status(200).json(role);
			} else {
				res.status(400).json({message: "Not even body parameters."})
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
