"use client";

import { cn } from "@/lib/utils";
import { usePriceStore } from "@/providers/PriceStoreProvider";
import { items, PricesStore } from "@/stores/prices";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Link from "next/link";
import { Fragment } from "react";
import PriceCard from "./PriceCard";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import PricesOCR from "../OCR/OCRComponent";
import { Button } from "../ui/button";
import { ScanText } from "lucide-react";

function NavigationAnchor({
  type,
  children,
  className,
  subtype,
}: {
  children: string;
  type: (typeof items)[number]["type"];
  className?: string;
  subtype?: (typeof items)[number]["subtype"];
}) {
  return (
    <Link
      href={`#${subtype || type}`}
      className={cn(
        "text-lg text-muted-foreground hover:text-foreground",
        { "text-md": subtype !== undefined },
        className,
      )}
    >
      <span>{children}</span>
    </Link>
  );
}

function PricesType({
  type,
  subtype,
  singleBlueCrystalValue,
  store,
  children,
  className,
}: {
  type: string;
  subtype?: string;
  singleBlueCrystalValue: number;
  store: PricesStore;
  children: string;
  className?: {
    title: string;
    container: string;
  };
}) {
  const [parent] = useAutoAnimate();
  return (
    <div>
      <div
        className="block relative top-[-70px] invisible"
        id={subtype || type}
      ></div>
      <h1
        className={cn(
          "text-2xl font-bold text-center md:text-start",
          {
            "text-xl": subtype !== undefined,
          },
          className?.title,
        )}
      >
        {children}
      </h1>
      <div
        className={cn(
          "mt-6 flex flex-row flex-wrap gap-3 justify-center md:justify-start",
          className?.container,
        )}
        ref={parent}
      >
        {items
          .filter((i) => i.type === type)
          .filter((i) => i.subtype === subtype)
          .map((item) => {
            const pSitem = store.prices.find((i) => i.id === item.id);
            return (
              <PriceCard
                key={item.id}
                item={item}
                pSitem={pSitem}
                changeValue={(n) => store.changePrice(item.id, n)}
                bcValue={singleBlueCrystalValue}
              />
            );
          })}
      </div>
    </div>
  );
}

const types = [
  { type: "store", name: "Store" },
  { type: "honing-t4", name: "Honing T4" },
  { type: "honing", name: "Honing T3" },
  {
    type: "tradeskills",
    name: "Trade Skills",
    subtypes: [
      { type: "foraging", name: "Foraging" },
      { type: "logging", name: "Logging" },
      { type: "mining", name: "Mining" },
      { type: "hunting", name: "Hunting" },
      { type: "fishing", name: "Fishing" },
      { type: "excavating", name: "Excavating" },
    ],
  },
];

export default function PriceCards() {
  const { store, hasHydrated } = usePriceStore((state) => state);
  const bcItem = store.prices.find((item) => item.id === "blue-crystal");
  const singleBlueCrystalValue = (bcItem?.price || 0) / 95;
  const [parent] = useAutoAnimate();

  if (!hasHydrated) {
    return null;
  }

  return (
    <div className="flex flex-row my-6 md:mx-12 gap-6 relative">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="fixed right-4 bottom-4">
            <ScanText className="mr-2 h-4 w-4" />
            Ocr
          </Button>
        </DialogTrigger>
        <PricesOCR />
      </Dialog>
      <div className="hidden md:block">
        <div className="flex flex-col gap-1 sticky top-[88px]">
          <h1 className="text-2xl font-bold mb-3">Navigation</h1>
          {types.map((type) => (
            <Fragment key={"na" + type.type}>
              <NavigationAnchor type={type.type}>{type.name}</NavigationAnchor>
              {type.subtypes?.map((subtype) => (
                <NavigationAnchor
                  key={"na" + type.type + subtype.type}
                  type={type.type}
                  subtype={subtype.type}
                  className="ml-3"
                >
                  {subtype.name}
                </NavigationAnchor>
              ))}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {types.map((type) => {
          if (type.subtypes !== undefined)
            return (
              <div key={type.type}>
                <div
                  className="block relative top-[-70px] invisible"
                  id={type.type}
                ></div>
                <div className="flex flex-col gap-6" ref={parent}>
                  <h1 className="text-2xl font-bold text-center md:text-start">
                    {type.name}
                  </h1>
                  {type.subtypes.map((subtype) => (
                    <PricesType
                      key={subtype.type}
                      type={type.type}
                      subtype={subtype.type}
                      singleBlueCrystalValue={singleBlueCrystalValue}
                      store={store}
                    >
                      {subtype.name}
                    </PricesType>
                  ))}
                </div>
              </div>
            );

          return (
            <PricesType
              key={type.type}
              type={type.type}
              singleBlueCrystalValue={singleBlueCrystalValue}
              store={store}
            >
              {type.name}
            </PricesType>
          );
        })}
      </div>
    </div>
  );
}
