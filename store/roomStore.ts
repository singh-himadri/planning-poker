import { create } from 'zustand';
import { RoomState } from '@/lib/types';

interface RoomStore {
    roomState: RoomState | null;
    username: string | null;
    setRoomState: (state: RoomState) => void;
    setUsername: (name: string) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
    roomState: null,
    username: null,
    setRoomState: (state) => set({ roomState: state }),
    setUsername: (name) => set({ username: name }),
}));
