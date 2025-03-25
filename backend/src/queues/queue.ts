// src/queue/index.ts
import { Queue } from "bullmq";
import { redisConnectionOptions } from "../config/redis.config";

/**
 * Factory function to create a BullMQ queue instance.
 * @param {string} queueName - Name of the queue.
 * @returns {Queue} - BullMQ Queue instance.
 */
export const createQueue = (queueName: string): Queue =>
    new Queue(queueName, { connection: redisConnectionOptions });
