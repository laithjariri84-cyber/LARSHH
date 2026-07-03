import { NextRequest } from "next/server";

import { apiSuccess, fromServiceResult } from "@/lib/api/response";
import { parseBody } from "@/lib/api/parse-request";
import { createEntityRepositories } from "@/lib/database/repositories/prisma-entity.repositories";
import { prisma } from "@/lib/prisma";
import { createTaskSchema, propertyIdParamSchema } from "@/lib/validation";

const entityRepos = createEntityRepositories(prisma);

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const parsed = propertyIdParamSchema.safeParse(params);
  if (!parsed.success) {
    return fromServiceResult({
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid property id" },
    });
  }

  const tasks = await entityRepos.tasks.findByProperty(parsed.data.id);
  return apiSuccess(tasks);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const idParsed = propertyIdParamSchema.safeParse(params);
  if (!idParsed.success) {
    return fromServiceResult({
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid property id" },
    });
  }

  const bodyParsed = await parseBody(request, createTaskSchema);
  if (!bodyParsed.ok) return bodyParsed.response;

  const task = await entityRepos.tasks.create({
    ...bodyParsed.data,
    propertyId: idParsed.data.id,
  });

  return apiSuccess(task, undefined, 201);
}
