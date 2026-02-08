"use client";

import { useRoomStore } from "@/store/roomStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getSocket } from "@/lib/socket";
import { Check, Crown, Eye, RefreshCw, Upload } from "lucide-react";
import { EstimationMode } from "@/lib/types";
import { useRef } from "react";

export function Table() {
    const { roomState } = useRoomStore();
    const socket = getSocket();
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!roomState) return null;

    const participants = Object.values(roomState.participants);
    const revealed = roomState.revealed;

    // Calculate Consensus logic inline
    const votes = participants.map(p => p.vote).filter(v => v !== undefined) as string[];
    const hasVotes = votes.length > 0;

    const handleReveal = () => {
        socket.emit("reveal", { roomId: roomState.roomId });
    };

    const handleReset = () => {
        socket.emit("reset-round", { roomId: roomState.roomId });
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                // Basic size check (approx 1MB limit)
                if (base64.length > 1500000) {
                    alert("Image too large! Please choose a smaller image.");
                    return;
                }
                socket.emit("update-avatar", { roomId: roomState.roomId, avatar: base64 });
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerUpload = () => fileInputRef.current?.click();

    let consensusNode: React.ReactNode = null;
    if (revealed && hasVotes) {
        if (roomState.mode === EstimationMode.FIBONACCI) {
            const numericVotes = votes.map(v => v === "?" ? null : parseFloat(v)).filter(v => v !== null) as number[];
            if (numericVotes.length > 0) {
                const sum = numericVotes.reduce((a, b) => a + b, 0);
                const avg = (sum / numericVotes.length).toFixed(1);
                const min = Math.min(...numericVotes);
                const max = Math.max(...numericVotes);
                const allEqual = numericVotes.every(v => v === numericVotes[0]);

                consensusNode = (
                    <div className="flex gap-4 text-center justify-center bg-background/50 p-2 rounded-lg backdrop-blur-sm border shadow-sm">
                        {allEqual ? (
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground uppercase">Consensus</span>
                                <span className="text-4xl font-bold text-green-600 dark:text-green-400">{numericVotes[0]}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-xs font-bold text-orange-500 uppercase tracking-wide border px-2 rounded-full border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-900">No Consensus</span>
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col px-2">
                                        <span className="text-xs text-muted-foreground">Avg</span>
                                        <span className="text-xl font-bold">{avg}</span>
                                    </div>
                                    <div className="flex flex-col px-2 border-l border-r border-border/50">
                                        <span className="text-xs text-muted-foreground">Min</span>
                                        <span className="text-lg text-blue-600 dark:text-blue-400">{min}</span>
                                    </div>
                                    <div className="flex flex-col px-2">
                                        <span className="text-xs text-muted-foreground">Max</span>
                                        <span className="text-lg text-red-600 dark:text-red-400">{max}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            } else {
                consensusNode = <span className="text-2xl font-bold">?</span>;
            }
        } else {
            // T-Shirt
            const counts: Record<string, number> = {};
            let maxCount = 0;
            votes.forEach(v => {
                counts[v] = (counts[v] || 0) + 1;
                if (counts[v] > maxCount) maxCount = counts[v];
            });
            const winners = Object.keys(counts).filter(k => counts[k] === maxCount);
            consensusNode = (
                <div className="flex flex-col items-center bg-background/50 p-2 rounded-lg backdrop-blur-sm">
                    <span className="text-xs text-muted-foreground uppercase">Result</span>
                    <span className="text-3xl font-bold">{winners.join(", ")}</span>
                </div>
            );
        }
    }

    const topRow = participants.filter((_, i) => i % 2 === 0);
    const bottomRow = participants.filter((_, i) => i % 2 !== 0);

    // Pass min/max to highlight extreme voters
    const minVote = revealed && !votes.every(v => v === votes[0]) && roomState.mode === EstimationMode.FIBONACCI
        ? Math.min(...votes.map(v => parseFloat(v)).filter(n => !isNaN(n)))
        : null;
    const maxVote = revealed && !votes.every(v => v === votes[0]) && roomState.mode === EstimationMode.FIBONACCI
        ? Math.max(...votes.map(v => parseFloat(v)).filter(n => !isNaN(n)))
        : null;

    return (
        <div className="relative w-full max-w-4xl mx-auto h-[700px] flex flex-col justify-center items-center">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
            />

            {/* Table Surface */}
            <div className="relative w-[300px] md:w-[600px] h-[230px] bg-indigo-100/30 dark:bg-indigo-900/30 border-4 border-indigo-200 dark:border-indigo-800 rounded-[100px] flex items-center justify-center shadow-xl backdrop-blur-sm">

                {/* Center Content */}
                <div className="flex flex-col items-center gap-2 z-10 w-full px-4">
                    {revealed ? (
                        <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300">
                            {consensusNode}
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleReset}
                                className="mt-2 shadow-lg"
                            >
                                <RefreshCw className="w-3 h-3 mr-2" />
                                New Round
                            </Button>
                        </div>
                    ) : (
                        <Button
                            size="lg"
                            className="rounded-full px-8 text-lg shadow-lg hover:shadow-primary/50 transition-all"
                            onClick={handleReveal}
                            disabled={!hasVotes}
                        >
                            <Eye className="w-5 h-5 mr-2" />
                            Reveal Cards
                        </Button>
                    )}
                </div>

                {/* Top Row */}
                <div className="absolute -top-28 left-0 right-0 flex justify-center gap-8 px-4 flex-wrap">
                    {topRow.map(p => (
                        <PlayerSeat
                            key={p.id}
                            player={p}
                            revealed={revealed}
                            position="top"
                            minVote={minVote}
                            maxVote={maxVote}
                            isSelf={p.id === socket.id}
                            onAvatarClick={triggerUpload}
                        />
                    ))}
                </div>

                {/* Bottom Row */}
                <div className="absolute -bottom-28 left-0 right-0 flex justify-center gap-8 px-4 flex-wrap">
                    {bottomRow.map(p => (
                        <PlayerSeat
                            key={p.id}
                            player={p}
                            revealed={revealed}
                            position="bottom"
                            minVote={minVote}
                            maxVote={maxVote}
                            isSelf={p.id === socket.id}
                            onAvatarClick={triggerUpload}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
}

function PlayerSeat({ player, revealed, position, minVote, maxVote, isSelf, onAvatarClick }: { player: any, revealed: boolean, position: "top" | "bottom", minVote?: number | null, maxVote?: number | null, isSelf?: boolean, onAvatarClick?: () => void }) {
    const isMin = revealed && minVote !== null && parseFloat(player.vote) === minVote;
    const isMax = revealed && maxVote !== null && parseFloat(player.vote) === maxVote;

    return (
        <div className="flex flex-col items-center gap-2 group w-20">
            {/* Card */}
            <div className={cn(
                "relative w-12 h-16 rounded-lg border-2 flex items-center justify-center text-xl font-bold shadow-sm transition-all duration-500 bg-background z-20",
                player.vote ? "border-primary -translate-y-2 shadow-md" : "border-dashed border-muted-foreground/30",
                revealed && player.vote ? "bg-primary text-primary-foreground scale-110" : "bg-card",
                !player.vote && "opacity-50",
                isMin && "ring-2 ring-blue-500 ring-offset-2",
                isMax && "ring-2 ring-red-500 ring-offset-2"
            )}>
                {revealed ? (player.vote || "-") : (player.vote ? <Check className="w-6 h-6" /> : "")}
            </div>

            {/* Avatar & Name */}
            <div className="flex flex-col items-center z-20">
                <div className="relative group/avatar cursor-pointer" onClick={isSelf ? onAvatarClick : undefined}>
                    <Avatar className={cn(
                        "w-10 h-10 border-2 border-background shadow-sm ring-2 ring-transparent transition-all",
                        isSelf ? "hover:ring-primary cursor-pointer hover:opacity-80" : "group-hover:ring-primary/20"
                    )}>
                        {player.avatar ? (
                            <AvatarImage src={player.avatar} alt={player.name} className="object-cover" />
                        ) : null}
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-xs">
                            {player.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    {isSelf && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 bg-black/40 rounded-full transition-opacity">
                            <Upload className="w-4 h-4 text-white" />
                        </div>
                    )}

                    {player.isAdmin && (
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full p-[2px] shadow-sm border border-white">
                            <Crown className="w-3 h-3" />
                        </div>
                    )}
                </div>
                <span className="text-[10px] font-medium mt-1 bg-background/80 px-2 py-0.5 rounded-full border shadow-sm truncate max-w-full text-center">
                    {player.name} {isSelf && "(You)"}
                </span>
            </div>
        </div>
    )
}
