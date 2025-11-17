import prisma from "@/lib/db";
import { zodChar } from "@/stores/main-store/types";
import z from "zod";

async function extractUserData(userId: string): Promise<z.infer<typeof zodChar>[]> {
  // Fetch user data from the database
  const characters = await prisma.character.findMany({
    where: { userId },
    include: {
      assignedRaids: {
        include: {
          gates: true,
        }
      },
      tasks: true,
    },
  });

  return characters.map((char) => ({
    id: char.id,
    name: char.name,
    class: char.class,
    itemLevel: char.itemLevel,
    isGoldEarner: char.isGoldEarner,
    isSpacer: false,
    assignedRaids: Object.fromEntries(
      char.assignedRaids.map((raid) => [
        raid.raidId,
        Object.fromEntries(
          raid.gates.map((gate) => [
            gate.gateId,
            {
              difficulty: gate.difficulty,
              completedDate: gate.completedDate
                ? gate.completedDate.getTime()
                : undefined,
            },
          ])
        ),
      ])
    ),
    tasks: [],
  }));
}

extractUserData("D9qxvvckoJj1J9AC6gzhcQ0zEGUsxAxc").then((data) => {
  console.log(JSON.stringify(data, null, 2));
});
