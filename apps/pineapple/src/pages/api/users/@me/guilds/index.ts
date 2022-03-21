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
		const result: any = jwt.verify(
			req.headers.authorization,
			process.env.SECRET_JWT as string
		);
		if (req.method === "GET") {
			const { before, after, limit } = req.query;
			const guilds = await prisma.member.findMany({
				where: {
					userId: Number(result.id),
					guildId: {
						gt: +after || undefined,
						lt: +before || undefined,
					},
				},
				select: {
					guild: true,
				},
				take: +limit || 200,
			});
			res.status(200).json(guilds);
		} else {
			res.status(405).json({ message: "Method not allowed." });
		}
	} catch {
		res.status(400).json({
			message: "Not Authenticated",
		});
	}
}
