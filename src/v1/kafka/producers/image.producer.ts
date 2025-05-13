import { producer } from '../../../plugins/kafka.js';
import { TOPICS, IMAGE_EVENTS } from '../constants.js';

export async function sendAvatarUploadEvent({
  userId,
  avatarUrl,
  timestamp = new Date().toISOString(),
}: {
  userId: number;
  avatarUrl: string;
  timestamp?: string;
}) {
  await producer.send({
    topic: TOPICS.IMAGE,
    messages: [
      {
        value: JSON.stringify({
          eventType: IMAGE_EVENTS.UPLOADED,
          userId,
          avatarUrl,
          timestamp,
          // type: 'avatar', 'cover' 등으로 확장 가능, 상수화도 좋음
        }),
      },
    ],
  });
}
