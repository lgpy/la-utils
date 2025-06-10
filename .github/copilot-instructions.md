# GitHub Copilot Instructions for Lost Ark Utils v2

This document provides guidance for using GitHub Copilot effectively with the Lost Ark Utils v2 project.

## Project Overview

Lost Ark Utils v2 is a Next.js application that provides various utilities for the game Lost Ark, including:

- Character management and tracking
- Raid completion tracking with gold earnings calculation
- Task management for daily and weekly activities
- Crafting cost calculator with profit estimation
- Auction calculator
- Price tracking for in-game items

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) with App Router
- **UI**: [React](https://react.dev/) with [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with persistence
- **Components**: [Shadcn UI](https://ui.shadcn.com/) components built on [Radix UI](https://www.radix-ui.com/) primitives
- **Animations**: [Motion](https://motion.dev/)
- **Date/Time Handling**: [Luxon](https://moment.github.io/luxon/)
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/) with [Zod](https://zod.dev/) for validation
- **Package Management**: [bun](https://bun.sh/) for fast builds and package management

## Project Structure

- **`app/`**: Next.js app router pages and API routes
- **`components/`**: React components organized by feature
- **`hooks/`**: Custom React hooks
- **`lib/`**: Utility functions and game data (characters, raids, items, etc.)
- **`providers/`**: React context providers for state management
- **`stores/`**: Zustand store definitions and actions

## Key Concepts

### Game Terminology
- **Characters**: Players can create multiple characters with different classes and item levels
- **Raids**: End-game group content with multiple difficulties (Normal/Hard)
- **Gates**: Subdivisions of raids (G1, G2, G3, etc.) that players complete for gold rewards
- **Reset**: Weekly (Wednesday) or daily refresh of available content
- **Gold Earner**: Characters marked to earn gold from raids (limited per account)

### ID Formats
- Raid IDs: lowercase names (`valtan`, `vykas`)
- Gate IDs: "G" + number (`G1`, `G2`) 
- Item IDs: kebab-case (`oreha-fusion-material`)
- Character IDs: UUID format

## Code Patterns

### State Management

The application uses Zustand for state management with specific patterns:

```typescript
// Store creation with persistence
export const createSomeStore = () =>
  createStore<SomeStore>()(
    persist(
      (set) => ({
        // State and actions
      }),
      { name: "storeName" }
    )
  );

// Store organization: main.ts, charActions.ts, raidActions.ts, settings.ts, etc.

// Providers make stores available via context
export const useMainStore = () => {
  const context = useContext(MainStoreContext);
  // Return store with additional derived state
};
```

### Data Validation

The project uses Zod for schema validation:

```typescript
// Define and use schemas
export const zodChar = z.object({
  id: z.string(),
  name: z.string(),
  // Other properties...
});

// Create specialized schemas
export const zodNewChar = zodChar.pick({
  name: true,
  class: true,
  // Other properties...
});
```

### Action Functions

Actions related to characters, raids, etc. follow this pattern:

```typescript
export function someAction(set: SetType, charId: string, ...) {
  set((state) => {
    const char = state.characters.find((c) => c.id === charId);
    if (!char) throw new Error("Character not found");
    
    // Modify state
    
    return { ...state };
  });
}
```

### Date Handling

The application uses custom date utilities for tracking reset times:

```typescript
// Get reset dates
const weeklyReset = getLatestWeeklyReset();
const dailyReset = getLatestDailyReset();
const biWeeklyReset = getLatestBiWeeklyReset("odd" | "even");

// Check completion status against reset dates
isGateCompleted(completionDate, resetDate);
isTaskCompleted(task, resetDate);
```

## Common Tasks

### Adding New Raid Content

Update the raids object in `lib/raids.ts`:

```typescript
newRaid: {
  name: "RaidName",
  gates: {
    G1: {
      difficulties: {
        [Difficulty.normal]: {
          itemlevel: 1600,
          rewards: { gold: 1000 },
        },
      },
    },
  },
}
```

### Adding New Character Classes

Update the Class enum in `lib/classes.ts` and create corresponding icons in `components/class-icons/`.

### Adding New Crafting Items

Update the craftingItems array in `stores/crafting.ts` with appropriate properties.

## Component Patterns

### Feature-based Components

```
components/
  FeatureName/
    FeatureComponent.tsx
    FeatureSubComponent.tsx
```

### Shared UI Components with shadcn

The project uses [shadcn/ui](https://ui.shadcn.com/) components which are implemented as separate files in the `components/ui/` directory:

```tsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
```

Each component file uses `class-variance-authority` (cva) for style variants and the `cn` utility for class name merging:

```tsx
<Button 
  variant="outline" 
  className={cn(
    "border-primary", 
    isActive && "bg-primary/10"
  )}
>
  Click me
</Button>
```

## Testing

Tests are written using Playwright and are located in the `tests/` directory.

## Deployment

The project is set up to deploy on Netlify with configuration in `netlify.toml`.
