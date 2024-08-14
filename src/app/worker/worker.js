let amqp = require("amqplib/callback_api");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { updateTaskStatus } = require("../lib/database");

amqp.connect("amqp://localhost", function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }

    var queue = "image_processing_queue";

    channel.assertQueue(queue, {
      durable: false,
    });
    channel.prefetch(1);

    console.log(" [x] Awaiting image process requests");
    channel.consume(queue, async function reply(msg) {
      const { taskId, fileName, filePath } = JSON.parse(msg.content.toString());
      console.log(` [x] Received task to process ${fileName}`);

      // let imageData = msg.content;
      // console.log("message in worker: ", msg);
      // console.log(" [.] imageData)", msg);
      try {
        let grayscaleBuffer = await sharp(filePath).greyscale().toBuffer();
        const outputFileName = `grayscale_${fileName}`;

        const outputFilePath = path.join(
          process.cwd(),
          "public",
          outputFileName
        );

        fs.writeFileSync(outputFilePath, grayscaleBuffer);
        const publicUrl = `/${outputFileName}`;

        console.log(` [.] Image saved to ${publicUrl}`);

        updateTaskStatus(taskId, "completed", publicUrl);

        // send processed image back to client

        // channel.sendToQueue(msg.properties.replyTo, grayscaleBuffer, {
        //   correlationId: msg.properties.correlationId,
        // });

        channel.ack(msg);
        console.log(
          ` [x] Processed image ${fileName} and saved to ${outputFilePath}`
        );
      } catch (err) {
        console.error("error");
        updateTaskStatus(taskId, "failed", null, err.message);
        channel.ack(msg);
      }
    });
  });
});
