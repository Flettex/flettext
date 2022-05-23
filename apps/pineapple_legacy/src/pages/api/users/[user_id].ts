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
		const { user_id } = req.query;
		if (req.method === "GET") {
			const user = await prisma.user.findUnique({
				where: {
					id: Number(user_id),
				},
				select: {
					id: true,
					username: true,
					email: true,
					avatarUrl: true,
					bio: true,
				},
			});
			res.status(200).json(user);
		} else {
			res.status(405).json({ message: "Method not allowed." });
		}
	} catch {
		res.status(400).json({
			message: "Not Authenticated",
		});
	}
}
