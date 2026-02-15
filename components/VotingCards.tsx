"use client";

import { useRoomStore } from "@/store/roomStore";
import { getSocket } from "@/lib/socket";
import { FIBONACCI_VALUES, TSHIRT_VALUES, EstimationMode } from "@/lib/types";
import { cn } from "@/lib/utils";
// import { motion } from "framer-motion";

export function VotingCards() {
    const { roomState } = useRoomStore();
    const socket = getSocket();

    if (!roomState) return null;

    const values = roomState.mode === EstimationMode.FIBONACCI ? FIBONACCI_VALUES : TSHIRT_VALUES;

    // Find my current vote
    const myId = socket.id;
    const myParticipant = roomState.participants[myId!];
    const currentVote = myParticipant?.vote;

    const handleVote = (value: string) => {
        if (!roomState.roomId) return;
        // Toggle vote if clicking same
        // const newValue = currentVote === value ? null : value;
        // For now the backend expects a value, let's just send it. 
        // If we want toggle off, we might need a clear-vote event or send empty string?
        // Current backend impl: room.participants[socket.id].vote = value;
        // Let's assume re-clicking is fine for now, or just updates.

        socket.emit("vote", { roomId: roomState.roomId, value });
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center items-end px-4 z-50 pointer-events-none pb-8">
            <div className="flex bg-background/80 backdrop-blur-md p-3 py-4 rounded-2xl shadow-2xl border pointer-events-auto gap-2 overflow-x-auto max-w-full items-end">
                {values.map((val) => (
                    <button
                        key={val}
                        onClick={() => handleVote(val)}
                        disabled={roomState.revealed}
                        className={cn(
                            "relative w-14 h-20 md:w-16 md:h-24 rounded-xl border-2 flex items-center justify-center text-xl font-bold shadow-sm transition-all duration-200 bg-card",
                            currentVote === val
                                ? "border-primary bg-primary text-primary-foreground -translate-y-2 shadow-xl scale-105"
                                : "border-muted hover:border-primary/50 hover:-translate-y-2 hover:shadow-lg",
                            roomState.revealed && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-sm"
                        )}
                    >
                        {val}
                    </button>
                ))}
            </div>
        </div>
    );
}
