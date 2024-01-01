import { Socket, Server as NetServer } from "net";
import {Server as SocketIoServer} from "socket.io"
import { NextApiResponse } from "next";
import { z } from "zod";

export const FormSchema = z.object({
  email: z.string().describe("Email").email({ message: "Invalid email" }),
  password: z
    .string()
    .describe("Password")
    .min(1, { message: "Password is required" }),
});

export const CreateWorkspaceFormSchema = z.object({
  workspaceName: z
    .string()
    .describe("Workspace Name")
    .min(1, "Workspace name must be min of 1 character"),
  logo: z.any(),
});

export const uploadBannerSchema = z.object({
  banner: z.string().describe("Banner Image"),
});

export type NextApiResponseServerio = NextApiResponse & {
  socket : Socket & {
    server : NetServer & {
      io : SocketIoServer
    }
  }
}