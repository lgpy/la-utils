import { servers, ServerStatus, setServerStatus } from "@/lib/servers";
import axios from "axios";
import * as cheerio from "cheerio";
import _ from "lodash";

export const revalidate = 300;

export type ServerStatusResponse = {
  lastUpdated: number;
  servers: typeof servers;
};

export async function GET(request: Request) {
  const serversClone = _.cloneDeep(servers);
  try {
    const { data: html } = await axios.get(
      "https://www.playlostark.com/en-us/support/server-status",
    );
    const $ = cheerio.load(html);
    $("div.ags-ServerStatus-content-responses-response-server").each(
      (i, el) => {
        const name = $(el)
          .find("div.ags-ServerStatus-content-responses-response-server-name")
          .text()
          .trim()
          .split(" ")[0]
          .trim();
        for (const region in serversClone) {
          if (Object.keys(servers[region]).includes(name)) {
            const status = $(el).find(
              "div.ags-ServerStatus-content-responses-response-server-status",
            );
            if (
              status.hasClass(
                "ags-ServerStatus-content-responses-response-server-status--good",
              )
            )
              setServerStatus(serversClone, name, ServerStatus.ONLINE);
            else if (
              status.hasClass(
                "ags-ServerStatus-content-responses-response-server-status--busy",
              )
            )
              setServerStatus(serversClone, name, ServerStatus.BUSY);
            else if (
              status.hasClass(
                "ags-ServerStatus-content-responses-response-server-status--full",
              )
            )
              setServerStatus(serversClone, name, ServerStatus.FULL);
            else if (
              status.hasClass(
                "ags-ServerStatus-content-responses-response-server-status--maintenance",
              )
            )
              setServerStatus(serversClone, name, ServerStatus.MAINTENANCE);
          }
        }
      },
    );

    return new Response(
      JSON.stringify({
        lastUpdated: new Date().getTime(),
        servers: serversClone,
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      },
    );
  } catch (error) {
    return new Response("Error fetching data", { status: 500 });
  }
}
