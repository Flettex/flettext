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
        jwt.verify(req.headers.authorization, process.env.SECRET_JWT as string);
        if (req.method === "POST") {
            if (req.body.recipient_id) {
                const dmchannel = await prisma.channel.create({
                    data: {
                        type: 'DMChannel',
                        recipientId: req.body.recipient_id
                    }
                });
                res.status(200).json(dmchannel);
            } else {
                res.status(400).json({ message: "Recipient_id was not provided" })
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