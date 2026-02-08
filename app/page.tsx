"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  const createRoom = () => {
    if (!name) return;
    const newRoomId = Math.random().toString(36).substring(2, 9);
    router.push(`/room/${newRoomId}?name=${encodeURIComponent(name)}`);
  };

  const joinRoom = () => {
    if (!name || !roomId) return;
    router.push(`/room/${roomId}?name=${encodeURIComponent(name)}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Planning Poker</CardTitle>
          <CardDescription className="text-center">Real-time estimation for agile teams</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <Button className="w-full" onClick={createRoom} disabled={!name}>
              Create New Room
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or join existing</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
              <Button variant="secondary" onClick={joinRoom} disabled={!name || !roomId}>
                Join
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
