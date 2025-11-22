/**
 * General Agent Service
 * 
 * This service handles non-finance queries using a lightweight LLM.
 * Responses are kept short (< 100 tokens) for speed and cost efficiency.
 * 
 * Target: < 2s response time (per spec)
 * 
 * Why this service exists: Provides quick, friendly responses for greetings,
 * help requests, and other non-financial queries without expensive agent overhead.
 */

import { Service } from "encore.dev/service";

export default new Service("general-agent");



