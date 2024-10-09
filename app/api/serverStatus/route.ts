import { servers, ServerStatus, setServerStatus } from "@/lib/servers";
import axios from "axios";
import * as cheerio from "cheerio";
import _ from "lodash";

export const revalidate = 60 * 5;

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
          .trim();
        if (Object.keys(servers).includes(name)) {
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
      },
    );

    return new Response(JSON.stringify(serversClone), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": `public, max-age=${revalidate}`,
      },
    });
  } catch (error) {
    return new Response("Error fetching data", { status: 500 });
  }
}
