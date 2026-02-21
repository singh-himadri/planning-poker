"use client";

import { useRoomStore } from "@/store/roomStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSocket } from "@/lib/socket";
import { Check, Crown, Eye, RefreshCw, Upload } from "lucide-react";
import { EstimationMode, Participant } from "@/lib/types";
import { useRef, useState, useEffect } from "react";
import { ConsensusDialog } from "@/components/ConsensusDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function Table() {
    const { roomState } = useRoomStore();
    const socket = getSocket();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [consensusDialogOpen, setConsensusDialogOpen] = useState(false);
    const [candidateConsensus, setCandidateConsensus] = useState<string | null>(null);
    const [localStoryName, setLocalStoryName] = useState("");

    // Sync storyName from room state (when other users update it)
    useEffect(() => {
        if (roomState?.storyName !== undefined) {
            setLocalStoryName(roomState.storyName);
        }
    }, [roomState?.storyName]);

    // Debounced emit to socket
    const storyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleStoryChange = (value: string) => {
        setLocalStoryName(value);
        if (storyDebounceRef.current) clearTimeout(storyDebounceRef.current);
        storyDebounceRef.current = setTimeout(() => {
            if (roomState) {
                socket.emit("set-story", { roomId: roomState.roomId, storyName: value });
            }
        }, 500);
    };


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

    const handleConsensusSelection = (value: string) => {
        setCandidateConsensus(value);
        setConsensusDialogOpen(true);
    };

    const confirmConsensus = (description: string) => {
        if (candidateConsensus) {
            socket.emit("set-consensus", {
                roomId: roomState.roomId,
                value: candidateConsensus,
                description
            });
        }
    };


    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
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
    if (roomState.consensus) {
        consensusNode = (
            <div className="flex flex-col items-center gap-4 animate-in zoom-in slide-in-from-bottom-5 duration-500 w-full max-w-md px-4">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Final Consensus</span>
                <div className="flex items-start justify-center gap-4 w-full">
                    <div className="w-10 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-xl flex items-center justify-center text-lg font-bold text-white border-2 border-white dark:border-gray-800 ring-2 ring-green-500/30 shrink-0">
                        {roomState.consensus.value}
                    </div>

                    {roomState.consensus.description && (
                        <div className="bg-background/50 backdrop-blur-md p-2 rounded-md border shadow-sm text-center flex-1 min-w-0">
                            <span className="text-[10px] text-muted-foreground uppercase">Notes</span>
                            <p className="text-xs font-medium line-clamp-2">{roomState.consensus.description}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    } else if (revealed && hasVotes) {
        const uniqueVotes = Array.from(new Set(votes));

        consensusNode = (
            <div className="flex flex-col items-center gap-4">
                <div className="flex gap-2 flex-wrap justify-center">
                    <TooltipProvider>
                        {uniqueVotes.map(vote => (
                            <Tooltip key={vote}>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => handleConsensusSelection(vote)}
                                        className="w-12 h-16 bg-card border hover:border-primary hover:scale-110 hover:-translate-y-1 transition-all rounded-md shadow-sm flex items-center justify-center font-bold text-lg"
                                    >
                                        {vote}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Choose as Consensus</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </TooltipProvider>
                </div>
                <span className="text-xs text-muted-foreground">Click a card to select consensus</span>
            </div>
        );
    }


    return (
        <div className="relative w-full max-w-4xl flex flex-col items-center">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
            />

            {/* Story Name Input */}
            <div className="w-full max-w-md mb-10">
                <input
                    type="text"
                    value={localStoryName}
                    onChange={(e) => handleStoryChange(e.target.value)}
                    placeholder="What are we estimating? (e.g. PROJ-123)"
                    className="w-full text-center text-lg font-bold bg-transparent border-b-2 border-dashed border-muted-foreground/40 hover:border-muted-foreground/70 ]
                    focus:border-primary focus:outline-none transition-colors py-1 placeholder:text-muted-foreground/50"
                />
            </div>

            {/* Table Surface — mt/mb make room for the absolutely-positioned participant rows */}
            <div className="relative w-[300px] md:w-[700px] h-[230px] mt-28 mb-28
            bg-indigo-200/30 dark:bg-indigo-900/30 border-4 border-indigo-400 dark:border-indigo-800 rounded-[100px] flex items-center justify-center shadow-xl backdrop-blur-sm">
                {/* Center Content */}
                <div className="flex flex-col items-center gap-2 z-10 w-full px-4">
                    {revealed ? (
                        <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300">
                            {consensusNode}
                            <ConsensusDialog
                                open={consensusDialogOpen}
                                onOpenChange={setConsensusDialogOpen}
                                selectedValue={candidateConsensus || ""}
                                onConfirm={confirmConsensus}
                            />
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


function PlayerSeat({
    player,
    revealed,
    minVote,
    maxVote,
    isSelf,
    onAvatarClick
}: {
    player: Participant,
    revealed: boolean,
    minVote?: number | null,
    maxVote?: number | null,
    isSelf?: boolean,
    onAvatarClick?: () => void
}) {
    const isMin = revealed && minVote !== null && player.vote && parseFloat(player.vote) === minVote;
    const isMax = revealed && maxVote !== null && player.vote && parseFloat(player.vote) === maxVote;

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
