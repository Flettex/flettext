import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken"
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function Get(req: NextApiRequest, res: NextApiResponse) {
    if (!req.headers.authorization) {
        res.status(400).json({
            message: "Bad Request. No authorization header provided"
        });
        return;
    }
    try {
        const result: any = jwt.verify(req.headers.authorization, process.env.SECRET_JWT as string);
        if (req.method === "DELETE") {
            const { guild_id } = req.query;
            await prisma.member.delete({
                where: {
                    user_unique_per_guild_constraint: {
                        guildId: +guild_id,
                        userId: result.id
                    }
                }
            });
            res.status(204).end();
        } else {
            res.status(405).json({message: "Method not allowed."})
        }
    } catch {
        res.status(400).json({
            message: "Not Authenticated"
        });
    }
}