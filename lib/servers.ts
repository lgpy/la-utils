export enum ServerStatus {
  ONLINE,
  OFFLINE,
  BUSY,
  FULL,
  MAINTENANCE,
}

export const servers: Record<string, Record<string, ServerStatus>> = {
  NAW: {
    Thaemine: ServerStatus.OFFLINE,
    Brelshaza: ServerStatus.OFFLINE,
  },
  NAE: {
    Luterra: ServerStatus.OFFLINE,
    Balthorr: ServerStatus.OFFLINE,
    Nineveh: ServerStatus.OFFLINE,
    Inanna: ServerStatus.OFFLINE,
    Vairgrys: ServerStatus.OFFLINE,
  },
  EUC: {
    Ortuus: ServerStatus.OFFLINE,
    Elpon: ServerStatus.OFFLINE,
    Ratik: ServerStatus.OFFLINE,
    Arcturus: ServerStatus.OFFLINE,
    Gienah: ServerStatus.OFFLINE,
  },
};

export function getServerStatus(serverObj: typeof servers, server: string) {
  for (const region in serverObj) {
    if (Object.keys(serverObj[region]).includes(server)) {
      return serverObj[region][server];
    }
  }
  return ServerStatus.OFFLINE;
}

export function getServerStatusString(status: ServerStatus) {
  switch (status) {
    case ServerStatus.OFFLINE:
      return "Offline";
    case ServerStatus.ONLINE:
      return "Online";
    case ServerStatus.FULL:
      return "Online - Full";
    case ServerStatus.BUSY:
      return "Online - Busy";
    case ServerStatus.MAINTENANCE:
      return "In Maintenance";
  }
}

export function setServerStatus(
  serversObj: typeof servers,
  server: string,
  status: ServerStatus,
) {
  for (const region in serversObj) {
    if (Object.keys(serversObj[region]).includes(server)) {
      serversObj[region][server] = status;
      return;
    }
  }
}
