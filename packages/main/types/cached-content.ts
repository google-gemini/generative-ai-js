import { Content, Part } from "./content";
import { Tool, ToolConfig } from "./function-calling";

/**
 * @public
 */
export interface CachedContentBase {
  model?: string;
  contents: Content[];
  tools?: Tool[];
  toolConfig?: ToolConfig;
  systemInstruction?: string | Part | Content;
}

/**
 * Describes CachedContent interface for sending to the server (if creating)
 * or received from the server (using getters or list methods).
 * @public
 */
export interface CachedContent extends CachedContentBase {
  ttl?: string;
  // ISO string
  createTime?: string;
  // ISO string
  updateTime?: string;
}