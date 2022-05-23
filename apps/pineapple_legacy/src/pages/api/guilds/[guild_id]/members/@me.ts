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
		if (req.method === "PATCH") {
			// change something about themselves
			// currently does not have nicknames... this endpoint will be nickname changing
			res.status(205).end();
			// if (req.body.permissions) {
			//     await prisma.member.update({
			//         where: {
			//             user_unique_per_guild_constraint: {
			//                 guildId: Number(guild_id),
			//                 userId: Number(user.id)
			//             }
			//         },
			//         data: {
			//             permissions: req.body.permissions || undefined
			//         }
			//     });
			// } else {
			//     res.status(400).json({ message: "Not enough body parameters to edit a member" })
			// }
		} else {
			res.status(405).json({ message: "Method not allowed." });
		}
	} catch (err: any) {
		res.status(400).json({
			message: err.message,
		});
	}
}
