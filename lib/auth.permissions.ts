import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc, userAc } from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  changelog: ["manage"],
  dashboard: ["view"],
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
  ...userAc.statements,
});

export const admin = ac.newRole({
  changelog: ["manage"],
  dashboard: ["view"],
  ...adminAc.statements,
});

