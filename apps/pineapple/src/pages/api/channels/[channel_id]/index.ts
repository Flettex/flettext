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
        const result: any = jwt.verify(req.headers.authorization, process.env.SECRET_JWT as string);
        const { channel_id } = req.query;
        if (req.method === "GET") {
            const channel = await prisma.channel.findUnique({
                where: {
                    id: +channel_id
                },
                select: {
                    guildId: true,
                    id: true,
                    name: true,
                    description: true,
                    createdAt: true,
                    position: true,
                    parentId: true,
                    type: true,
                    ratelimit: true
                }
            });
            if (channel) {
                res.status(200).json(channel);
            } else {
                res.status(400).json({ message: "Channel not found" })
            }
        } else if (req.method === "PATCH") {
            if (req.body.name || req.body.type || req.body.description || req.body.parentId) {
                await prisma.channel.update({
                    where: {
                        id: +channel_id
                    },
                    data: {
                        name: req.body.name || undefined,
                        type: req.body.type || undefined,
                        description: req.body.description || undefined,
                        parentId: req.body.parentId || undefined
                    }
                });
            } else {
                res.status(400).json({ message: "Not enough body parameters provided" })
            }
        } else if (req.method === "DELETE") {
            const channel = await prisma.channel.findUnique({
                where: {
                    id: +channel_id
                },
                select: {
                    type: true,
                    id: true,
                    recipients: true,
                    createdAt: true
                }
            });
            if (channel && channel.type === 'DMChannel') {
                await prisma.recipient.update({
                    where: {
                        user_unique_per_channel_constraint:{
                            userId: result.id,
                            channelId: channel.id
                        }
                    },
                    data: {
                        archived: true
                    },
                    select: {}
                });
                res.status(200).json({
                    ...channel,
                    recipients: channel.recipients.map((user) => ({
                        ...user,
                        archived: user.userId === result.id
                    }))
                });
            } else if (channel && channel.type === 'categoryChannel') {
                const children = await prisma.channel.findMany({
                    where: {
                        parentId: +channel_id
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
                    }
                });
                await prisma.channel.updateMany({
                    where: {
                        parentId: +channel_id
                    },
                    data: {
                        parentId: null,
                        position: {
                            decrement: 1
                        }
                    }
                });
                const deleted = await prisma.channel.delete({
                    where: {
                        id: +channel_id,
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
                    }
                });
                res.status(200).json(deleted);
                children.map((item) => ({...item, parentId: null, position: (item.position || 1) - 1}));
            } else if (channel) {
                const deleted = await prisma.channel.delete({
                    where: {
                        id: +channel_id,
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
                    }
                });
                res.status(200).json(deleted);
            } else {
                res.status(400).json({ message: "Channel was not found" })
            }
        } else {
            res.status(405).json({message: "Method not allowed."});
        }
    } catch (err: any) {
        res.status(400).json({
            message: err.message
        });
    }
}