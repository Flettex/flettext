import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function Get(req: NextApiRequest, res: NextApiResponse) {
    if (!req.headers.authorization) {
        res.status(400).json({
            message: "Bad Request. No authorization header provided"
        });
        return;
    }
    try {
        const user: any = jwt.verify(req.headers.authorization, process.env.SECRET_JWT as string);
        const { guild_id, user_id } = req.query;
        if (req.method === "GET") {
            const data = await prisma.member.findUnique({
                where: {
                    user_unique_per_guild_constraint: {
                        guildId: Number(guild_id),
                        userId: Number(user_id)
                    }
                }
            });
            if (req.body.name) {
                if (data) {
                    res.status(200).json(data);
                } else {
                    res.status(406).json({ message: "Guild id or User id not acceptable" });
                }
            } else {
                res.status(400).json({
                    message: "Message invalid."
                })
            }
        } else if (req.method === "PUT") {
            // join guild
            // note: this grabs id from token... not query params
            // idk if this endpoint is even correct like user_id isn't even used
            await prisma.member.create({
                data: {
                    userId: Number(user.id),
                    guildId: Number(guild_id),
                    // no perms... maybe MESSAGING permissions?
                    permissions: 0x0
                }
            });
            res.status(204).end();
        } else if (req.method === "PATCH") {
            // change something about a member
            if (req.body.permissions) {
                await prisma.member.update({
                    where: {
                        user_unique_per_guild_constraint: {
                            guildId: Number(guild_id),
                            userId: Number(user.id)
                        }
                    },
                    data: {
                        permissions: req.body.permissions || undefined
                    }
                });
            } else {
                res.status(400).json({ message: "Not enough body parameters to edit a member" })
            }
        } else if (req.method === "DELETE") {
            // kick member
            // does not support KICK_MEMBER yet
            res.status(204).end();
        } else {
            res.status(405).json({ message: "Method not allowed." })
        }
    } catch (err: any) {
        res.status(400).json({
            message: err.message
        });
    }
}