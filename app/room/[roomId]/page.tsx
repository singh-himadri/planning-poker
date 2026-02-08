"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { useRoomStore } from "@/store/roomStore";
import { VotingCards } from "@/components/VotingCards";
import { Table } from "@/components/Table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EstimationMode } from "@/lib/types";
import { Copy, LogOut, Settings } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";

export default function RoomPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    // Safe access or cast
    const roomId = params?.roomId as string || "";
    const initialName = searchParams?.get("name") || "";

    const [name, setName] = useState(initialName);
    const [hasJoined, setHasJoined] = useState(false);
    const { roomState, setRoomState, setUsername } = useRoomStore();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (name && !hasJoined) {
            const initSocket = async () => {
                await fetch('/api/socket/io');
                const socket = getSocket();

                socket.on("connect", () => {
                    console.log("Connected to socket");
                    socket.emit("join-room", { roomId, name });
                });

                socket.on("room-state", (state) => {
                    console.log("Received room state:", state);
                    setRoomState(state);
                });

                // Ensure socket is connected (will trigger connect event if not already)
                if (!socket.connected) {
                    socket.connect();
                }
            };
            initSocket();
            setHasJoined(true);
            setUsername(name);

            return () => {
                const socket = getSocket();
                socket.off("connect");
                socket.off("room-state");
                // Don't disconnect here to allow hot reload perseverance in dev, 
                // but in prod we might want to.
                // socket.disconnect(); 
            };
        }
    }, [name, roomId, hasJoined, setRoomState, setUsername]);

    if (!isClient) return null; // Hydration fix

    if (!hasJoined || !name) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-center">Join Room</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Button className="w-full" onClick={() => setHasJoined(false)} disabled={!name}>
                            Join
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
    };

    const handleChangeMode = (mode: string) => {
        console.log("Changing mode to:", mode);
        getSocket().emit("change-mode", { roomId, mode: mode as EstimationMode });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
            {/* Ambient Bacground */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-background to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 -z-10" />

            {/* Header */}
            <header className="p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-primary text-primary-foreground p-2 rounded-lg font-bold">PP</div>
                    <div>
                        <h1 className="font-bold leading-none">Planning Poker</h1>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            Room: {roomId}
                            <button onClick={handleCopyLink} className="hover:text-foreground">
                                <Copy className="h-3 w-3" />
                            </button>
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-2 bg-muted/50 p-1 rounded-lg border">
                        <span className="text-xs font-medium px-2 text-muted-foreground">Estimate Mode:</span>
                        <Select
                            value={roomState?.mode || EstimationMode.FIBONACCI}
                            onValueChange={handleChangeMode}
                            disabled={!roomState}
                        >
                            <SelectTrigger className="h-8 w-[120px] bg-background border-none shadow-sm">
                                <SelectValue placeholder="Mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={EstimationMode.FIBONACCI}>Fibonacci</SelectItem>
                                <SelectItem value={EstimationMode.TSHIRT}>T-Shirt</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Settings className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Room Settings</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="md:hidden">
                                {/* Mobile Mode Switch - Simplified */}
                                Switch Mode (Use Desktop for full controls)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.location.reload()}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Leave Room
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <ModeToggle />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
                <Table />
            </main>

            {/* Floating UI */}
            <VotingCards />
        </div>
    );
}
