const amqplib = require("amqplib");

const QUEUE_NAME = "application_notifications";

let connection = null;
let channel = null;

const connectRabbitMQ = async () => {
  connection = await amqplib.connect(
    process.env.RABBITMQ_URL || "amqp://localhost",
  );
  channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  console.log("RabbitMQ producer connected");
};

/**
 * Kirim pesan notifikasi ke queue
 * @param {object} payload - { applicationId, jobId, applicantId }
 */
const publishApplicationNotification = async (payload) => {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }

  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(payload)), {
    persistent: true,
  });
};

module.exports = {
  connectRabbitMQ,
  publishApplicationNotification,
  QUEUE_NAME,
};
