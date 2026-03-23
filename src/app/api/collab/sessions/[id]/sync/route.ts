import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkGenericRateLimit, createRateLimitResponse } from "@/lib/security";
import type { SyncMessage } from "@/lib/collab-types";

// In-memory message buffer for SSE broadcasting
const messageBuffers = new Map<string, SyncMessage[]>();
const MAX_BUFFER_SIZE = 100;

// Track active SSE connections per session (prevent connection flooding)
const activeConnections = new Map<string, number>();
const MAX_CONNECTIONS_PER_SESSION = 8; // Max 4 users * 2 (reconnect buffer)

function getBuffer(sessionId: string): SyncMessage[] {
  let buffer = messageBuffers.get(sessionId);
  if (!buffer) {
    buffer = [];
    messageBuffers.set(sessionId, buffer);
  }
  return buffer;
}

function addMessage(sessionId: string, message: SyncMessage): void {
  const buffer = getBuffer(sessionId);
  buffer.push(message);
  // Trim to max size
  if (buffer.length > MAX_BUFFER_SIZE) {
    buffer.splice(0, buffer.length - MAX_BUFFER_SIZE);
  }
}

/**
 * GET /api/collab/sessions/[id]/sync?userId=...
 * Server-Sent Events stream for real-time collaboration sync.
 *
 * Security: SSE connections cannot use standard header-based auth easily.
 * We validate:
 * 1. userId format is valid (injection prevention)
 * 2. User exists in database
 * 3. User is an active participant of the session
 * 4. Session is active
 * 5. Connection count doesn't exceed limit (DoS prevention)
 * 6. Rate limiting per user
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;

  // Validate sessionId format
  if (!/^[a-zA-Z0-9_-]{10,50}$/.test(sessionId)) {
    return NextResponse.json({ error: "Invalid session ID format" }, { status: 400 });
  }

  // Extract userId from query params (SSE connections can't easily send auth headers)
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId query parameter is required" }, { status: 400 });
  }

  // Validate userId format to prevent injection
  if (!/^[a-zA-Z0-9_-]{10,50}$/.test(userId)) {
    return NextResponse.json({ error: "Invalid userId format" }, { status: 400 });
  }

  // Rate limit SSE connection attempts (prevent reconnect flooding)
  const rateCheck = checkGenericRateLimit(`sse:connect:${userId}`, 10, 60_000);
  if (!rateCheck.allowed) {
    return createRateLimitResponse(rateCheck.retryAfterMs);
  }

  // Check connection count per session (DoS prevention)
  const currentConnections = activeConnections.get(sessionId) || 0;
  if (currentConnections >= MAX_CONNECTIONS_PER_SESSION) {
    return NextResponse.json({ error: "Too many connections to this session" }, { status: 429 });
  }

  // Verify the userId exists in the database
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!userExists) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  // Verify session exists and is active
  const collabSession = await prisma.collabSession.findUnique({
    where: { id: sessionId },
    select: { isActive: true },
  });

  if (!collabSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (!collabSession.isActive) {
    return NextResponse.json({ error: "Session has ended" }, { status: 410 });
  }

  // Verify user is a participant (critical auth check)
  const participant = await prisma.collabParticipant.findUnique({
    where: {
      sessionId_userId: { sessionId, userId },
    },
  });

  if (!participant || participant.leftAt !== null) {
    return NextResponse.json({ error: "You're not in this session" }, { status: 403 });
  }

  // Track connection
  activeConnections.set(sessionId, currentConnections + 1);

  // Track the last message index we sent
  const buffer = getBuffer(sessionId);
  let lastIndex = buffer.length;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send an initial connection confirmation
      const connectMsg = `data: ${JSON.stringify({ type: "connected", sessionId, timestamp: Date.now() })}\n\n`;
      controller.enqueue(encoder.encode(connectMsg));

      const interval = setInterval(() => {
        try {
          const currentBuffer = getBuffer(sessionId);

          // Send any new messages since our last index
          while (lastIndex < currentBuffer.length) {
            const message = currentBuffer[lastIndex];
            const data = `data: ${JSON.stringify(message)}\n\n`;
            controller.enqueue(encoder.encode(data));
            lastIndex++;
          }
        } catch {
          // Stream may have been closed
          clearInterval(interval);
        }
      }, 300);

      // Clean up when the client disconnects
      const cleanup = () => {
        clearInterval(interval);
        // Decrement connection count
        const count = activeConnections.get(sessionId) || 1;
        if (count <= 1) {
          activeConnections.delete(sessionId);
        } else {
          activeConnections.set(sessionId, count - 1);
        }
        try {
          controller.close();
        } catch {
          // Already closed
        }
      };

      request.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

/**
 * POST /api/collab/sessions/[id]/sync
 * Send a sync message to the session. Updates the in-memory buffer
 * and persists relevant state changes to the database.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: sessionId } = await params;

    // Validate sessionId format
    if (!/^[a-zA-Z0-9_-]{10,50}$/.test(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID format" }, { status: 400 });
    }

    // Rate limit: 120 messages per minute per user (2/sec)
    const rateCheck = checkGenericRateLimit(`sync:post:${session.user.id}`, 120, 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const message: SyncMessage = await request.json();

    // Validate message structure
    if (!message.type || !message.senderId || !message.sessionId) {
      return NextResponse.json({ error: "Invalid sync message" }, { status: 400 });
    }

    // Validate message type is a known type
    const validMessageTypes = [
      "pattern_update", "bpm_change", "genre_change", "part_change",
      "emotion_change", "heartbeat", "cursor_move", "chat_message",
      "participant_join", "participant_leave", "instrument_assign",
      "virtual_band_update", "recording_state",
    ];
    if (!validMessageTypes.includes(message.type)) {
      return NextResponse.json({ error: "Invalid message type" }, { status: 400 });
    }

    // Ensure the sessionId in the URL matches the message
    if (message.sessionId !== sessionId) {
      return NextResponse.json({ error: "Session ID mismatch" }, { status: 400 });
    }

    // SECURITY: Verify the senderId matches the authenticated user
    if (message.senderId !== session.user.id) {
      return NextResponse.json({ error: "Sender ID mismatch" }, { status: 403 });
    }

    // Validate chat message content (XSS prevention)
    if (message.type === "chat_message" && message.data?.text) {
      const text = String(message.data.text);
      if (text.length > 500) {
        return NextResponse.json({ error: "Message too long" }, { status: 400 });
      }
      // Sanitize chat text
      message.data.text = text
        .replace(/<[^>]+>/g, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "")
        .trim();
    }

    // Verify session is active
    const collabSession = await prisma.collabSession.findUnique({
      where: { id: sessionId },
      select: { isActive: true },
    });

    if (!collabSession || !collabSession.isActive) {
      return NextResponse.json({ error: "Session not found or has ended" }, { status: 404 });
    }

    // Add message to the in-memory buffer for SSE delivery
    addMessage(sessionId, message);

    // Persist state changes to the database based on message type
    switch (message.type) {
      case "pattern_update": {
        const data = message.data;
        if (data.fullSync && data.pattern) {
          await prisma.collabSession.update({
            where: { id: sessionId },
            data: { patternData: data.pattern as object },
          });
        }
        break;
      }

      case "bpm_change": {
        const bpm = message.data.bpm;
        if (typeof bpm === "number") {
          await prisma.collabSession.update({
            where: { id: sessionId },
            data: { bpm: Math.min(300, Math.max(40, bpm)) },
          });
        }
        break;
      }

      case "genre_change": {
        const genre = message.data.genre;
        if (typeof genre === "string" && genre.length <= 50) {
          await prisma.collabSession.update({
            where: { id: sessionId },
            data: { genre },
          });
        }
        break;
      }

      case "part_change": {
        const songPart = message.data.songPart;
        if (typeof songPart === "string" && songPart.length <= 50) {
          await prisma.collabSession.update({
            where: { id: sessionId },
            data: { songPart },
          });
        }
        break;
      }

      case "emotion_change": {
        const emotion = message.data.emotion;
        if (emotion === null || (typeof emotion === "string" && emotion.length <= 50)) {
          await prisma.collabSession.update({
            where: { id: sessionId },
            data: { emotion: (emotion as string) || null },
          });
        }
        break;
      }

      // heartbeat, cursor_move, chat_message, etc. don't need DB persistence
      default:
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing sync message:", error);
    return NextResponse.json({ error: "Failed to process sync message" }, { status: 500 });
  }
}
