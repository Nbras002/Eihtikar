import type { Room, Player } from "@shared/schema";

export interface IStorage {
  getRoom(id: string): Room | undefined;
  getRoomByCode(code: string): Room | undefined;
  createRoom(room: Room): void;
  updateRoom(room: Room): void;
  deleteRoom(id: string): void;
  getAllRooms(): Room[];
}

export class MemStorage implements IStorage {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map();
  }

  getRoom(id: string): Room | undefined {
    return this.rooms.get(id);
  }

  getRoomByCode(code: string): Room | undefined {
    return Array.from(this.rooms.values()).find(room => room.code === code);
  }

  createRoom(room: Room): void {
    this.rooms.set(room.id, room);
  }

  updateRoom(room: Room): void {
    this.rooms.set(room.id, room);
  }

  deleteRoom(id: string): void {
    this.rooms.delete(id);
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  // Clean up empty or stale rooms (older than 2 hours)
  cleanupStaleRooms(): void {
    const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
    for (const [id, room] of this.rooms) {
      if (room.players.length === 0 || room.createdAt < twoHoursAgo) {
        this.rooms.delete(id);
      }
    }
  }
}

export const storage = new MemStorage();

// Run cleanup every 30 minutes
setInterval(() => {
  storage.cleanupStaleRooms();
}, 30 * 60 * 1000);
