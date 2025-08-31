import { Kafka } from 'kafkajs';
import * as process from 'node:process';

export const kafka = new Kafka({
  brokers: process.env.KAFKA_BROKER.split(','),
  ssl: false,
});
export const producer = kafka.producer();

producer.connect().catch((err) => {
  console.error('Failed to connect Kafka producer:', err);
  process.exit(1);
});
