/**
 * Chat Gateway Service
 * 
 * This service acts as the entry point for all chat interactions.
 * It handles message routing, classification, and streaming responses.
 * 
 * Why this service exists: Provides a unified API for the frontend to send
 * messages and receive real-time agent responses via Server-Sent Events.
 */

import { Service } from "encore.dev/service";

export default new Service("chat-gateway");



