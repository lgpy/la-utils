import axios from "axios";
import * as cheerio from "cheerio";
import _ from "lodash";

//export const revalidate = 60 * 5;

const servers: Record<
  string,
  {
    status: "online" | "offline" | "busy" | "full" | "maintenance";
    region: "NAW" | "NAE" | "EUC";
  }
> = {
  Thaemine: {
    status: "offline",
    region: "NAW",
  },
  Brelshaza: {
    status: "offline",
    region: "NAW",
  },
  Luterra: {
    status: "offline",
    region: "NAE",
  },
  Balthorr: {
    status: "offline",
    region: "NAE",
  },
  Nineveh: {
    status: "offline",
    region: "NAE",
  },
  Inanna: {
    status: "offline",
    region: "NAE",
  },
  Vairgrys: {
    status: "offline",
    region: "NAE",
  },
  Ortuus: {
    status: "offline",
    region: "EUC",
  },
  Elpon: {
    status: "offline",
    region: "EUC",
  },
  Ratik: {
    status: "offline",
    region: "EUC",
  },
  Arcturus: {
    status: "offline",
    region: "EUC",
  },
  Gienah: {
    status: "offline",
    region: "EUC",
  },
};

export async function GET(request: Request) {
  const ret = _.cloneDeep(servers);
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
            ret[name].status = "online";
          else if (
            status.hasClass(
              "ags-ServerStatus-content-responses-response-server-status--busy",
            )
          )
            ret[name].status = "busy";
          else if (
            status.hasClass(
              "ags-ServerStatus-content-responses-response-server-status--full",
            )
          )
            ret[name].status = "full";
          else if (
            status.hasClass(
              "ags-ServerStatus-content-responses-response-server-status--maintenance",
            )
          )
            ret[name].status = "maintenance";
        }
      },
    );

    ret["Gienah"].status = Math.random() < 0.5 ? "online" : "offline";

    return new Response(JSON.stringify(ret), {
      status: 200,
      headers: {
        "content-type": "application/json",
        //"cache-control": `public, max-age=${revalidate}`,
      },
    });
  } catch (error) {
    return new Response("Error fetching data", { status: 500 });
  }
}
