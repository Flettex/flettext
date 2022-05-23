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
		jwt.verify(req.headers.authorization, process.env.SECRET_JWT as string);
		const { guild_id } = req.query;
		// default limit is still 1
		const data = await prisma.member.findMany({
			where: {
				guildId: Number(guild_id),
				userId: Number(req.query.userId) || undefined,
			},
			take: req.query.limit ? Number(req.query.limit) : 1,
		});
		if (req.method === "GET") {
			if (req.body.name) {
				if (data) {
					res.status(200).json(data);
				} else {
					res.status(406).json({
						message: "Guild id or User id not acceptable",
					});
				}
			} else {
				res.status(400).json({
					message: "Message invalid.",
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
