/**
 * Message Classifier Service
 * 
 * This service determines whether a user message is finance-related
 * (requiring the specialized finance agent) or general (handled by
 * the lightweight general agent).
 * 
 * Why this service exists: Intelligent routing is critical for providing
 * fast, cost-effective responses while maintaining quality for finance queries.
 */

import { Service } from "encore.dev/service";

export default new Service("message-classifier");



