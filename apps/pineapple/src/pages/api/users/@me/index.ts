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
        if (req.method === "GET") {
            const user = await prisma.user.findUnique({
                where: {
                    id: result.id
                },
                select: {
                    username: true,
                    id: true,
                    email: true,
                    avatarUrl: true,
                    bio: true,
                }
            });
            res.status(200).json(user);
        } else if (req.method === "PATCH") {
            if (req.body.username || req.body.avatar) {
                res.status(200).json(await prisma.user.update({
                    where: {
                        id: result.id
                    },
                    data: {
                        username: req.body.username || undefined,
                        avatarUrl: req.body.avatar || undefined
                    }
                }))
            } else {
                res.status(400).json({ message: "Not enough body parameters" });
            }
        } else {
            res.status(405).json({message: "Method not allowed."})
        }
    } catch {
        res.status(400).json({
            message: "Not Authenticated"
        });
    }
}