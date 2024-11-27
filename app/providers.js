'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

const getCharNames = () => {
  const chars = window.localStorage.getItem("characters")
  if (!chars) return []
  const jsonChars = JSON.parse(chars)
  const characters = jsonChars.state.characters
  return characters.map((char) => char.name) || []
}

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: window.location.origin+'/ingest',
    ui_host: 'https://eu.posthog.com',
    person_profiles: 'identified_only',
  })
  const chars = getCharNames();
  if (chars.length > 0) {
    posthog.identify(
      undefined,
      {
        characters: chars
      }
    )
  }
}
export function CSPostHogProvider({ children }) {
  if (process.env.NODE_ENV !== 'production') {
    return <>{children}</>
  }
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}