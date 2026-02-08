import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIO, RoomState, EstimationMode, Participant } from "@/lib/types";

// Global store for rooms to survive hot reloads in dev
declare global {
    var rooms: Record<string, RoomState>;
}

if (!global.rooms) {
    global.rooms = {};
}
const rooms = global.rooms;

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
    if (!res.socket.server.io) {
        const path = "/api/socket/io";
        const httpServer: NetServer = res.socket.server as any;
        const io = new ServerIO(httpServer, {
            path: path,
            addTrailingSlash: false,
        });
        res.socket.server.io = io;

        io.on("connection", (socket) => {
            // console.log("Socket connected:", socket.id);

            socket.on("join-room", ({ roomId, name }, callback) => {
                socket.join(roomId);

                if (!rooms[roomId]) {
                    rooms[roomId] = {
                        roomId,
                        mode: EstimationMode.FIBONACCI,
                        revealed: false,
                        participants: {},
                    };
                }

                const room = rooms[roomId];

                // Check if participant already exists (prevent duplicates)
                if (!room.participants[socket.id]) {
                    const participant: Participant = {
                        id: socket.id,
                        name,
                        vote: undefined,
                        isAdmin: Object.keys(room.participants).length === 0 // First joiner is admin
                    };

                    room.participants[socket.id] = participant;
                    io.to(roomId).emit("participant-join", { name });
                } else {
                    // Update existing participant's name if rejoining
                    room.participants[socket.id].name = name;
                }

                io.to(roomId).emit("room-state", room);

                if (callback) callback({ status: "ok" });
            });

            socket.on("vote", ({ roomId, value }) => {
                const room = rooms[roomId];
                if (room && room.participants[socket.id]) {
                    room.participants[socket.id].vote = value;
                    io.to(roomId).emit("room-state", room);
                }
            });

            socket.on("reveal", ({ roomId }) => {
                const room = rooms[roomId];
                if (room) {
                    room.revealed = true;
                    io.to(roomId).emit("room-state", room);
                    io.to(roomId).emit("votes-revealed", room);
                }
            });

            socket.on("reset-round", ({ roomId }) => {
                const room = rooms[roomId];
                if (room) {
                    room.revealed = false;
                    Object.values(room.participants).forEach(p => p.vote = undefined);
                    io.to(roomId).emit("room-state", room);
                }
            });

            socket.on("change-mode", ({ roomId, mode }) => {
                const room = rooms[roomId];
                if (room) {
                    room.mode = mode;
                    io.to(roomId).emit("room-state", room);
                }
            });

            socket.on("update-avatar", ({ roomId, avatar }) => {
                const room = rooms[roomId];
                if (room && room.participants[socket.id]) {
                    room.participants[socket.id].avatar = avatar;
                    io.to(roomId).emit("room-state", room);
                }
            });

            socket.on("disconnecting", () => {
                const roomsToLeave = [...socket.rooms];
                roomsToLeave.forEach(roomId => {
                    if (rooms[roomId] && rooms[roomId].participants[socket.id]) {
                        // const name = rooms[roomId].participants[socket.id].name;
                        delete rooms[roomId].participants[socket.id];
                        io.to(roomId).emit("participant-leave", { id: socket.id });
                        io.to(roomId).emit("room-state", rooms[roomId]);

                        if (Object.keys(rooms[roomId].participants).length === 0) {
                            delete rooms[roomId];
                        }
                    }
                });
            });
        });
    }
    res.end();
};

export default ioHandler;
