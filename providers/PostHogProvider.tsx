"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react"
import { Suspense, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useMainStore } from "./MainStoreProvider"
import { Class } from "@/lib/classes"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: "/ingest",
      ui_host: "https://eu.posthog.com",
      capture_pageview: false, // We capture pageviews manually
      capture_pageleave: true,  // Enable pageleave capture
      debug: process.env.NODE_ENV === "development",
    })
  }, [])

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      <CharacterPropertiesUpdater />
      {children}
    </PHProvider>
  )
}

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname
      const search = searchParams.toString()
      if (search) {
        url += "?" + search
      }
      posthog.capture("$pageview", { "$current_url": url })
    }
  }, [pathname, searchParams, posthog])

  return null
}

function CharacterPropertiesUpdater() {
  const { characters, hasHydrated } = useMainStore()
  const posthog = usePostHog()

  useEffect(() => {
    if (hasHydrated && characters.length > 0 && posthog) {
      // Calculate character properties
      const totalCharacters = characters.length
      const goldEarners = characters.filter(char => char.isGoldEarner).length

      // Count characters by class
      const classCounts = characters.reduce<Record<string, number>>((acc, char) => {
        const className = Class[char.class]
        acc[className] = (acc[className] || 0) + 1
        return acc
      }, {})

      // store characters in PostHog
      const characterData = characters.map(char => ({
        name: char.name,
        itemLevel: char.itemLevel,
        class: Class[char.class],
        isGoldEarner: char.isGoldEarner,
      }))

      // set main character (highest item level)
      const mainCharacter = characters.reduce((prev, current) => {
        return (current.itemLevel > prev.itemLevel) ? current : prev;
      })

      // Set user properties in PostHog
      posthog.setPersonProperties({
        main: mainCharacter.name,
        characters: characterData,
        total_characters: totalCharacters,
        gold_earners: goldEarners,
        class_distribution: classCounts,
        highest_item_level: mainCharacter.itemLevel,
      })
    }
  }, [hasHydrated, characters, posthog])

  return null
}

function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  )
}
