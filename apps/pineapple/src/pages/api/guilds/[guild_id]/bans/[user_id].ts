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
        jwt.verify(req.headers.authorization, process.env.SECRET_JWT as string);
        const { guild_id, user_id } = req.query;
        if (req.method === "GET") {
            res.status(204).end();
        } else if (req.method === "PUT") {
            res.status(204).end();
        } else if (req.method === "DELETE") {
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