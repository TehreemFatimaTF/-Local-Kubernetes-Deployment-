/**
 * Chat API Service
 *
 * T065-T066: API client for stateless chat endpoint
 * Handles communication with the backend chat API
 */

export interface ToolInvocation {
  tool_name: string;
  parameters: Record<string, any>;
  result: Record<string, any>;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
}

export interface ChatResponse {
  conversation_id: string;
  message_id: string;
  role: string;
  content: string;
  tool_invocations?: ToolInvocation[];
  created_at: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: string;
}

/**
 * Send a chat message to the API
 *
 * @param userId - User identifier
 * @param request - Chat request with message and optional conversation_id
 * @returns Promise resolving to chat response
 * @throws Error with structured error response on failure
 */
export async function sendChatMessage(
  userId: string,
  request: ChatRequest
): Promise<ChatResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  try {
    const response = await fetch(`${apiUrl}/api/${userId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      // Parse error response
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    const data: ChatResponse = await response.json();
    return data;
  } catch (error) {
    // Re-throw with context
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to send chat message');
  }
}
