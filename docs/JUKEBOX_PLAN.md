# Collaborative YouTube Playlist with WebRTC Sync

## Overview

Build a "listening party" feature for D&D ambience where a host controls a YouTube playlist and listeners stay synced via WebRTC data channels. Val Town handles signaling; all sync happens peer-to-peer after connection.

## Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   Val Town      │◄───────►│   Netlify       │
│   (Signaling)   │  REST   │   (Static App)  │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │ Initial handshake         │ Serves UI
         │ only                      │
         ▼                           ▼
    ┌─────────────────────────────────────┐
    │         WebRTC Data Channels        │
    │  Host ◄──────────────────► Guests   │
    │        (P2P after connect)          │
    └─────────────────────────────────────┘
```

## Components

### 1. Val Town Signaling Server

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/rooms` | Host creates room, stores SDP offer |
| GET | `/rooms/:id` | Guest fetches host's offer |
| POST | `/rooms/:id/answer` | Guest submits SDP answer |
| GET | `/rooms/:id/answers` | Host polls for guest answers |
| DELETE | `/rooms/:id` | Cleanup (optional) |

**Data Model (SQLite):**
```sql
rooms: { id, host_offer, created_at }
answers: { id, room_id, guest_id, answer, created_at }
```

**Auto-cleanup:** Rooms older than 1 hour are deleted (signaling is only needed for initial connection).

### 2. Client-Side WebRTC Layer

**Host responsibilities:**
- Generate room via Val Town
- Create RTCPeerConnection for each joining guest
- Broadcast sync messages: `{ type: 'sync', videoId, position, queue, playing }`
- Send on: video change, play/pause, skip, periodic heartbeat (every 30s)

**Guest responsibilities:**
- Fetch host offer from Val Town
- Establish P2P connection
- Listen for sync messages
- Adjust local YouTube player to match

**Libraries:**
- None required (native WebRTC APIs)
- Optional: `simple-peer` for cleaner API (small, no server dependency)

### 3. YouTube Player Integration

Use YouTube IFrame API:
- `player.loadVideoById(videoId)`
- `player.seekTo(seconds)`
- `player.playVideo()` / `player.pauseVideo()`
- `player.getCurrentTime()` for sync checks

**Sync strategy:**
1. On receiving sync message, check if correct video is playing
2. If wrong video → load correct one
3. If same video but position differs by >5 seconds → seek to correct position
4. Play/pause state matches host

### 4. UI (Eleventy Page)

New page at `/jukebox/` with:

**Host view:**
- URL/video ID input to add videos
- Playlist queue (drag to reorder, remove)
- Playback controls (play/pause/skip)
- Room code display + share link
- Connected guests count
- Save/load playlist presets (localStorage)

**Guest view:**
- Room code input to join
- YouTube player (synced)
- Current playlist view (read-only)
- Connection status indicator

## File Structure

```
content/jukebox.md          # Page frontmatter
_includes/jukebox.njk       # Layout template
src/
  jukebox/
    signaling.js            # Val Town API client
    webrtc.js               # P2P connection management
    player.js               # YouTube IFrame API wrapper
    sync.js                 # Sync message handling
    ui.js                   # UI state management
    styles.css              # Jukebox-specific styles
```

## Implementation Steps

### Phase 1: Val Town Signaling Server
1. Create Val Town account (if needed)
2. Implement room creation endpoint (POST /rooms)
3. Implement offer retrieval (GET /rooms/:id)
4. Implement answer submission (POST /rooms/:id/answer)
5. Implement answer polling (GET /rooms/:id/answers)
6. Add auto-cleanup for stale rooms
7. Test endpoints manually with curl/Postman

### Phase 2: WebRTC Connection Layer
1. Create signaling.js client for Val Town API
2. Create webrtc.js with host connection management
3. Add guest connection flow
4. Test P2P data channel messaging between two browsers
5. Handle reconnection/error states

### Phase 3: YouTube Player Integration
1. Create player.js wrapper for IFrame API
2. Implement loadVideo, seek, play/pause controls
3. Create sync.js message protocol
4. Implement host → guest sync broadcasts
5. Implement guest sync reception and player adjustment
6. Test sync with two browser windows

### Phase 4: UI Implementation
1. Create jukebox page and layout
2. Build host UI: playlist management, room creation
3. Build guest UI: room join, synced player
4. Add connection status indicators
5. Add localStorage save/load for playlist presets
6. Style the interface

### Phase 5: Polish & Edge Cases
1. Handle guest disconnect/reconnect
2. Handle host disconnect (guests see "host disconnected" state)
3. Add "request control" feature (optional, guest can ask to add to queue)
4. Mobile-friendly layout

## Sync Message Protocol

```typescript
// Host → Guests
{ type: 'sync', videoId: string, position: number, playing: boolean, queue: string[] }
{ type: 'skip', videoId: string }
{ type: 'queue-update', queue: string[] }

// Guest → Host (optional, for future features)
{ type: 'request-add', videoId: string, title: string }
```

## STUN/TURN Configuration

```javascript
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};
```

No TURN server initially - for home networks and most connections, STUN is sufficient. If users report connection issues, consider adding a free TURN service or Twilio's TURN (has free tier).

## Verification

1. **Signaling:** Create room, fetch offer, submit answer - all return expected data
2. **P2P Connection:** Two browsers establish data channel, send test messages
3. **Player Sync:** Host plays video, guest player loads same video within 2-3 seconds
4. **Playlist Sync:** Host adds/removes/reorders queue, guest sees updates
5. **Reconnection:** Guest refreshes page, can rejoin room and resync
6. **Multi-guest:** 3+ browsers connect simultaneously, all stay synced

## Design Decisions

- **Video input:** Paste YouTube URLs/IDs only (no API key required)
- **Persistence:** LocalStorage saves host's playlists for reuse between sessions
- **Integration:** Standalone page at `/jukebox/`, no D&D site integration
