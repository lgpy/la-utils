import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth.server";
import prisma from "@/lib/db";
import { getUncompressedBody } from "@/lib/requests.server";
import { zodChar } from "@/stores/main";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return NextResponse.json({
      error: "Unauthorized"
    }, { status: 401 });
  }

  const body = await getUncompressedBody(request);

  const chars = zodChar.array().safeParse(body);

  if (!chars.success) {
    return NextResponse.json({
      error: "Invalid character data"
    }, { status: 400 });
  }

  // First, delete characters that are not in the uploaded list
  await prisma.character.deleteMany({
    where: { AND: [{ userId: session.user.id }, { id: { notIn: chars.data.map((char) => char.id) } }] }
  });

  // Then, upsert each character individually (not in a transaction)
  await Promise.all(
    chars.data.map(async (char) => {
      await prisma.character.upsert({
        where: { userId_id: { userId: session.user.id, id: char.id } },
        update: {
          name: char.name,
          class: char.class,
          itemLevel: char.itemLevel,
          isGoldEarner: char.isGoldEarner,
          tasks: {
            deleteMany: {},
            createMany: {
              data: char.tasks.map((task) => ({
                id: task.id,
                name: task.name,
                type: task.type,
                completedDate: task.completedDate ? new Date(task.completedDate) : null,
              }))
            }
          },
          assignedRaids: {
            deleteMany: {},
            create: Object.entries(char.assignedRaids).map(([raidId, raidInfo]) => ({
              raidId,
              gates: {
                create: Object.entries(raidInfo).map(([gateId, gateInfo]) => ({
                  gateId,
                  difficulty: gateInfo.difficulty,
                  completedDate: gateInfo.completedDate ? new Date(gateInfo.completedDate) : null,
                }))
              }
            }))
          }
        },
        create: {
          id: char.id,
          name: char.name,
          class: char.class,
          itemLevel: char.itemLevel,
          isGoldEarner: char.isGoldEarner,
          userId: session.user.id,
          tasks: {
            createMany: {
              data: char.tasks.map((task) => ({
                id: task.id,
                name: task.name,
                type: task.type,
                completedDate: task.completedDate ? new Date(task.completedDate) : null,
              }))
            }
          },
          assignedRaids: {
            create: Object.entries(char.assignedRaids).map(([raidId, raidInfo]) => ({
              raidId,
              gates: {
                create: Object.entries(raidInfo).map(([gateId, gateInfo]) => ({
                  gateId,
                  difficulty: gateInfo.difficulty,
                  completedDate: gateInfo.completedDate ? new Date(gateInfo.completedDate) : null,
                }))
              }
            }))
          }
        },
        include: {
          assignedRaids: {
            include: {
              gates: true
            }
          },
          tasks: true,
        }
      });
    })
  );

  return NextResponse.json({
    message: "Data uploaded successfully"
  });
}
