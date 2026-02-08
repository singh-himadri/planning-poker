"use client";

import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "./types";

let socket: Socket<ServerToClientEvents, ClientToServerEvents>;

export const getSocket = () => {
    if (!socket) {
        socket = io({
            path: "/api/socket/io",
            addTrailingSlash: false,
        });
    }
    return socket;
};
