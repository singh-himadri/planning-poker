"use client";

import { useRoomStore } from "@/store/roomStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check } from "lucide-react";

export function VotesPanel() {
    const { roomState } = useRoomStore();

    if (!roomState) return null;

    const participants = Object.values(roomState.participants);
    const revealed = roomState.revealed;
    const consensusValue = roomState.consensus?.value;

    return (
        <Card className="max-h-[600px] w-full md:w-[300px] flex flex-col bg-background/50 backdrop-blur-sm border-s">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                    <span>Votes</span>
                    <span className="text-xs font-normal text-muted-foreground">
                        {participants.length} participants
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full px-4">
                    <div className="flex flex-col gap-2 pb-4">
                        {participants.map((p) => {
                            const isConsensus = revealed && consensusValue && p.vote === consensusValue;
                            return (
                                <div
                                    key={p.id}
                                    className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${isConsensus
                                        ? "bg-green-500/10 border-green-500/50"
                                        : "bg-card border-border hover:bg-accent/50"
                                        }`}
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <Avatar className="w-8 h-8 border">
                                            {p.avatar && <AvatarImage src={p.avatar} />}
                                            <AvatarFallback className="text-[10px]">
                                                {p.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium truncate max-w-[100px]">
                                            {p.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {revealed ? (
                                            <span className={`font-mono font-bold ${isConsensus ? "text-green-600 dark:text-green-400" : ""}`}>
                                                {p.vote || "-"}
                                            </span>
                                        ) : (
                                            p.vote ? <Check className="w-4 h-4 text-primary" /> : <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
