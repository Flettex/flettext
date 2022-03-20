import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken"
import { PrismaClient } from '@prisma/client';
import { randomUUID } from "crypto";

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
        const { invite_code } = req.query;
        if (!invite_code) {
            res.status(400).json({ message: "No invite code provided." });
            return
        }
        if (req.method === "GET") {
            const guild = await prisma.guild.findUnique({
                where: {
                    invite: String(invite_code)
                }
            });
            res.status(200).json(guild);
        } else if (req.method === "POST") {
            // join guild
            const guild = await prisma.guild.findUnique({
                where: {
                    invite: String(invite_code)
                },
                select: {
                    id: true
                }
            });
            if (guild) {
                const member = await prisma.member.create({
                    data: {
                        guildId: guild.id,
                        userId: result.id,
                        permissions: 0x0
                    }
                });
                res.status(200).json(member);
            } else {
                res.status(400).json({ message: "Cannot find invite" })
            }
        } else if (req.method === "DELETE") {
            const newUUID = randomUUID();
            await prisma.guild.update({
                where: {
                    invite: String(invite_code)
                },
                data: {
                    invite: newUUID
                }
            });
            res.status(200).json({ newUUID });
        } else {
            res.status(405).json({message: "Method not allowed."})
        }
    } catch {
        res.status(400).json({
            message: "Not Authenticated"
        });
    }
}