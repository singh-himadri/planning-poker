"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { useRoomStore } from "@/store/roomStore";
import { VotingCards } from "@/components/VotingCards";
import { Table } from "@/components/Table";
import { VotesPanel } from "@/components/VotesPanel";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EstimationMode } from "@/lib/types";
import { Check, Copy, LogOut, Settings } from "lucide-react";
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
    const router = useRouter();
    const roomId = params?.roomId as string || "";
    const initialName = searchParams?.get("name") || "";

    const [name, setName] = useState(initialName);
    const [hasJoined, setHasJoined] = useState(false);
    const [copied, setCopied] = useState(false);
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
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name, roomId, hasJoined]);

    if (!isClient) return null;

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
        const pathParts = window.location.pathname.split("/");
        const roomCode = pathParts[pathParts.length - 1];

        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleChangeMode = (mode: string) => {
        console.log("Changing mode to:", mode);
        getSocket().emit("change-mode", { roomId, mode: mode as EstimationMode });
    };

    const handleLeaveRoom = () => {
        const socket = getSocket();
        socket.emit("leave-room", { roomId });
        socket.disconnect();
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
            {/* Ambient Bacground */}
            <div className="absolute inset-0 bg-linear-to-br from-indigo-50/50 via-background to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 -z-10" />

            {/* Header */}
            <header className="p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <img src="/planning_poker.svg" alt="Download" className="w-10 h-10" />
                    <div>
                        <h1 className="font-bold leading-none">Planning Poker</h1>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            Room: {roomId}
                            <button
                                onClick={handleCopyLink}
                                className="relative hover:text-foreground transition-colors group"
                            >
                                {copied ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                    <Copy className="h-3 w-3" />
                                )}
                                <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-popover text-popover-foreground border text-[10px] px-1.5 py-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity">
                                    {copied ? "Copied party code!" : "Copy room code"}
                                </span>
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
                            <DropdownMenuItem onClick={handleLeaveRoom}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Leave Room
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <ModeToggle />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4 pb-32 relative overflow-y-auto w-full">
                <Table />
                <div className="hidden md:block absolute right-4 top-4">
                    <VotesPanel />
                </div>
            </main>


            {/* Floating UI */}
            <VotingCards />
        </div>
    );
}
