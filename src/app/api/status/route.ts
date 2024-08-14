import { getTaskStatus } from "@/app/lib/database";
import { NextResponse } from "next/server";

export const GET = async (req: { url: string | URL }) => {
  const { searchParams } = new URL(req.url);
  console.log(searchParams, "search param");
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json(
      { error: "Task ID not provided" },
      { status: 400 }
    );
  }

  try {
    const status = await getTaskStatus(taskId);
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
