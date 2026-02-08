export enum EstimationMode {
    FIBONACCI = "FIBONACCI",
    TSHIRT = "TSHIRT"
}

export const FIBONACCI_VALUES = [
    "0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89", "?"
];

export const TSHIRT_VALUES = [
    "XS", "S", "M", "L", "XL"
];

export interface Participant {
    id: string;        // socket.id
    name: string;
    vote?: string;
    avatar?: string;
    isAdmin?: boolean; // Track who created the room/can reveal
}

export interface RoomState {
    roomId: string;
    mode: EstimationMode;
    revealed: boolean;
    participants: Record<string, Participant>;
}

import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

export type NextApiResponseServerIO = NextApiResponse & {
    socket: Socket & {
        server: NetServer & {
            io: SocketIOServer;
        };
    };
};

// Socket Events
export interface ServerToClientEvents {
    "room-state": (state: RoomState) => void;
    "participant-join": (data: { name: string }) => void;
    "participant-leave": (data: { id: string }) => void;
    "votes-revealed": (state: RoomState) => void;
    "pong": () => void;
}

export interface ClientToServerEvents {
    "join-room": (data: { roomId: string; name: string }, callback?: (ack: any) => void) => void;
    "vote": (data: { roomId: string; value: string }) => void;
    "reveal": (data: { roomId: string }) => void;
    "reset-round": (data: { roomId: string }) => void;
    "change-mode": (data: { roomId: string; mode: EstimationMode }) => void;
    "update-avatar": (data: { roomId: string; avatar: string }) => void;
    "ping": () => void;
}
