import { NextResponse } from "next/server";
var amqp = require("amqplib/callback_api");
import path from "path";
const { v4: uuidv4 } = require("uuid");
import fs from "fs";
import { sendToRabbitMQ } from "./sendToRabbit.js";

export const POST = async (req: any) => {
  const taskId = uuidv4();

  try {
    const { imageData } = await req.json();

    if (!imageData) {
      return NextResponse.json({ error: "No image data provided" });
    }

    const match = imageData.match(/^data:(.+);base64,(.+)$/);

    if (!match) {
      return NextResponse.json(
        { error: "Invalid image data" },
        { status: 400 }
      );
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const extension = mimeType.split("/")[1];

    // generate unique file name and path
    const fileName = `upload_${Date.now()}.${extension}`;
    const filePath = path.join("/tmp/", fileName);

    //Convert base64 data to binary and save
    const buffer = Buffer.from(base64Data, "base64");
    fs.writeFileSync(filePath, buffer);

    // await sendToRabbitMQ(filePath, fileName);
    await sendToRabbitMQ(taskId, fileName, filePath);
    return NextResponse.json({ taskId });
  } catch (error) {
    console.error("Error handling upload:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
};
