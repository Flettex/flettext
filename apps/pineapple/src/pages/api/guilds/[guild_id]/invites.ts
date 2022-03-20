import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client";
// returns list of invites... the other invite endpoint is /invites
const prisma = new PrismaClient();