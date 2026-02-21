"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggle";

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950 p-4 relative overflow-hidden">
        {/* Geometric Pattern Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
          {/* Grid Pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
            linear-gradient(to right, rgb(148 163 184 / 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(148 163 184 / 0.1) 1px, transparent 1px)
          `,
            backgroundSize: '40px 40px'
          }}></div>

          {/* Floating Cards Pattern */}
          <div className="absolute top-20 left-[10%] w-16 h-24 border-2 border-blue-300 dark:border-blue-700 rounded-lg rotate-12 opacity-30"></div>
          <div className="absolute top-40 right-[15%] w-16 h-24 border-2 border-indigo-300 dark:border-indigo-700 rounded-lg -rotate-6 opacity-30"></div>
          <div className="absolute bottom-32 left-[20%] w-16 h-24 border-2 border-purple-300 dark:border-purple-700 rounded-lg rotate-[-20deg] opacity-30"></div>
          <div className="absolute bottom-20 right-[25%] w-16 h-24 border-2 border-blue-300 dark:border-blue-700 rounded-lg rotate-6 opacity-30"></div>

          {/* Gradient Orbs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/20 to-indigo-400/20 dark:from-blue-600/10 dark:to-indigo-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-400/20 to-pink-400/20 dark:from-purple-600/10 dark:to-pink-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="absolute top-4 right-4 z-10">
          <ModeToggle />
        </div>

        <Card className="w-full max-w-md relative z-10 shadow-2xl border-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
          <CardHeader className="space-y-4 pb-4">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 flex items-center justify-center text-foreground">
              <svg viewBox="40 30 160 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
                {/* Accent shadow card */}
                <rect x="50" y="40" width="140" height="160" rx="16" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.15" />
                {/* Card background */}
                <rect x="40" y="30" width="140" height="160" rx="16" stroke="currentColor" strokeWidth="6" fill="none" />
                {/* Corner dots */}
                <circle cx="65" cy="55" r="6" fill="currentColor" />
                <circle cx="155" cy="165" r="6" fill="currentColor" />
                {/* Check mark */}
                <path d="M80 115 L100 135 L140 90" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Planning Poker
              </CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                Real-time estimation for agile teams
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Your Name
              </Label>
              <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 text-base border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && name) createRoom();
                  }}
              />
            </div>

            {/* Create Room Button */}
            <Button
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                onClick={createRoom}
                disabled={!name}
            >
              <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                />
              </svg>
              Create New Room
            </Button>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t-2 border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-3 py-1 text-gray-500 dark:text-gray-500 font-semibold rounded-full border border-gray-200 dark:border-gray-800">
                Or join existing
              </span>
              </div>
            </div>

            {/* Join Room Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomId" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Room ID
                </Label>
                <Input
                    id="roomId"
                    placeholder="Enter room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="h-12 text-base border-2 focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && name && roomId) joinRoom();
                    }}
                />
              </div>

              <Button
                  variant="secondary"
                  className="w-full h-12 text-base font-semibold border-2 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all duration-300 hover:scale-[1.02]"
                  onClick={joinRoom}
                  disabled={!name || !roomId}
              >
                <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Join Room
              </Button>
            </div>

            {/* Info Footer */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-center space-x-6 text-xs text-gray-500 dark:text-gray-500">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Real-time</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Collaborative</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Secure</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}