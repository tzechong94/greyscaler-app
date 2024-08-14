const { v4: uuidv4 } = require("uuid");
var amqp = require("amqplib");
import fs from "fs";
import path from "path";

// export async function sendToRabbitMQ(filePath, fileName) {
export async function sendToRabbitMQ(taskId, fileName, filePath) {
  // const taskId = uuidv4(); // Generate a unique task ID

  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const queue = "image_processing_queue";
    // const replyQueue = await channel.assertQueue("", { exclusive: true });

    const message = { taskId, fileName, filePath };
    console.log("message in send to rbabit", message);
    // const message = { taskId, filePath, fileName };

    // console.log(` [x] Requesting image process ${fileName}, taskId: ${taskId}`);

    // channel.consume(
    //   replyQueue.queue,
    //   (msg) => {
    //     if (msg.properties.correlationId === taskId) {
    //       console.log("Is buffer?, ", Buffer.isBuffer(msg.content));
    //       const grayscaleBuffer = msg.content;

    //       //   console.log(" [.] Got back after processing", msg.content);
    //       const outputFilePath = path.join(
    //         "/tmp/",
    //         `processed_${Date.now()}.png`
    //       );

    //       fs.writeFileSync(outputFilePath, grayscaleBuffer);

    //       console.log(` [.] Image saved to ${outputFilePath}`);

    //       setTimeout(() => {
    //         connection.close();
    //       }, 500);
    //     }
    //   },
    //   { noAck: true }
    // );

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: false,
      correlationId: taskId,
      // replyTo: replyQueue.queue,
    });

    console.log(` [x] Sent task ${fileName} with Task ID: ${taskId}`);

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error("Error in sendToRabbitMQ:", error);
  }
}
