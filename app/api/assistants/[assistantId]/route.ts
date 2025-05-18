import { openai } from "@/app/openai";

export const runtime = "nodejs";

export async function GET(request, { params: { assistantId } }) {
  const assistant = await openai.beta.assistants.retrieve(assistantId);
  return Response.json(assistant);
}

export async function PUT(request, { params: { assistantId } }) {
  const body = await request.json();
  const updated = await openai.beta.assistants.update(assistantId, body);
  return Response.json(updated);
}

export async function DELETE(request, { params: { assistantId } }) {
  await openai.beta.assistants.del(assistantId);
  return new Response();
}
