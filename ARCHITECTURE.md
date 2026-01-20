# Architecture

## Overview
The application uses an operation-based synchronization model where drawing actions are stored as operations rather than pixel data.

## Data Flow
1. User draws on canvas
2. Points are streamed via WebSocket
3. Completed strokes are stored as operations on the server
4. Server broadcasts updates to all clients
5. Clients redraw by replaying operations

## Drawing Model
Each stroke is stored as:
- Unique ID
- Color
- Stroke width
- List of points

## Real-Time Communication
Socket.io is used for:
- Room-based isolation
- Stroke streaming
- User join/leave events
- Undo/redo commands

## Undo/Redo Strategy
Undo and redo operate on a global operation log maintained by the server. When triggered, the server updates the log and broadcasts the new state to all clients.

## Conflict Resolution
Conflicts are resolved by operation order. Overlapping strokes are allowed and rendered deterministically.

## Performance Considerations
- Point-based streaming instead of images
- Event batching to limit network traffic
- Full redraw only on undo, redo, or late join

## Scalability
The system can scale by sharding users by room and running multiple WebSocket instances behind a load balancer.
