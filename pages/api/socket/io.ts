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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

                // Check for existing participant with same name (handle potential stale sessions/refresh)
                const existingParticipantId = Object.keys(room.participants).find(
                    id => room.participants[id].name === name
                );

                if (existingParticipantId && existingParticipantId !== socket.id) {
                    // Remove the old participant entry
                    delete room.participants[existingParticipantId];
                    // Optionally notify that the old session was removed?
                    // For now, just silently cleanup to avoid duplicates.
                }

                // Check if participant already exists (prevent duplicates by socket id)
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
                    // Update existing participant's name if rejoining (though we handled name clash above)
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
                    delete room.consensus;
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

            socket.on("set-consensus", ({ roomId, value, description }) => {
                const room = rooms[roomId];
                // Only allow setting consensus if revealed? Or any time? Usually after reveal.
                if (room) {
                    room.consensus = { value, description };
                    // Ensure it is revealed if not already (though UI should handle this)
                    room.revealed = true;
                    io.to(roomId).emit("room-state", room);
                }
            });

            socket.on("set-story", ({ roomId, storyName }) => {
                const room = rooms[roomId];
                if (room) {
                    room.storyName = storyName;
                    io.to(roomId).emit("room-state", room);
                }
            });

            socket.on("leave-room", ({ roomId }) => {
                const room = rooms[roomId];
                if (room && room.participants[socket.id]) {
                    delete room.participants[socket.id];
                    socket.leave(roomId);
                    io.to(roomId).emit("participant-leave", { id: socket.id });
                    io.to(roomId).emit("room-state", room);

                    // Clean up empty rooms
                    if (Object.keys(room.participants).length === 0) {
                        delete rooms[roomId];
                    }
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
