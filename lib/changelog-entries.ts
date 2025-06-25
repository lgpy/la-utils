'server only';

import { z } from "zod";

export const zodChangelogEntry = z.object({
  id: z.string(),
  date: z.string(),
  title: z.string(),
  description: z.string(),
  details: z.array(z.tuple([z.enum(["added", "fixed", "removed", "improved", "changed"]), z.string()])).optional(),
});

type ChangelogEntry = z.infer<typeof zodChangelogEntry>;


export const changelogEntries: ChangelogEntry[] = [
  {
    id: "2-7-2024-start-of-the-app",
    date: "2/7/2024",
    title: "Start of the App",
    description: "Initial release of Lost Ark Utils with core functionality.",
    details: [
      ["added", "Raid completion tracking system"],
      ["added", "App theming and logo"],
    ],
  },
  {

    id: "7-7-2024-character-raid-management",
    date: "7/7/2024",
    title: "Character and Raid Management",
    description: "Added character management and raid assignment features.",
    details: [
      ["added", "Character management system"],
      ["added", "Raid assignment functionality"],
      ["added", "Auction calculator tool"],
      ["improved", "UI and theming styling"],
    ],
  },
  {
    title: "Import/Export Character Data",
    date: "20/7/2024",
    id: "20-7-2024-import-export-character-data",
    description: "Added import/export functionality for character data.",
    details: [
      ["added", "Character data import/export"],
      ["improved", "UI and performance"],
      ["changed", "Theme styling"],
    ],
  },
  {
    title: "Prices Page and UI Improvements",
    date: "30/7/2024",
    id: "30-7-2024-prices-page-ui-improvements",
    description: "Enhanced the prices page, overall UI and added gold rewards to raids for future tracking.",
    details: [
      ["added", "Gold rewards tracking for raids"],
      ["added", "Onboarding flow"],
      ["added", "UI animations"],
      ["improved", "UI and theme styling"],
      ["added", "Item prices page"],
    ],
  },
  {
    title: "Crafting Page and UI Improvements",
    date: "10/8/2024",
    id: "10-8-2024-crafting-page-ui-improvements",
    description: "Added a crafting page and made various UI enhancements.",
    details: [
      ["added", "Crafting calculator page"],
      ["improved", "User interface"],
      ["improved", "Prices page functionality"],
    ],
  },
  {
    id: "26-8-2024-roster-gold-tracking",
    date: "26/8/2024",
    title: "Roster Gold Tracking & Character Improvements",
    description: "Added comprehensive gold tracking for your entire roster and improved character management.",
    details: [
      ["added", "Roster-wide gold tracking system"],
      ["added", "Old price warnings on crafting"],
      ["added", "Movable character cards"],
      ["improved", "User interface"],
    ],
  },
  {
    id: "1-9-2024-character-gold-tracking",
    date: "1/9/2024",
    title: "Character Gold Tracking",
    description: "Enhanced individual character gold tracking and user interface.",
    details: [
      ["added", "Individual character gold tracking"],
      ["improved", "User interface"],
    ],
  },
  {
    id: "12-9-2024-behemoth-raid",
    date: "12/9/2024",
    title: "Behemoth Raid Support",
    description: "Added support for the new Behemoth raid content.",
    details: [
      ["added", "Behemoth raid content and rewards"],
    ],
  },
  {
    id: "3-10-2024-roster-improvements-server-status",
    date: "3/10/2024",
    title: "Roster Improvements & Server Status",
    description: "Enhanced roster gold tracking and added server status monitoring.",
    details: [
      ["added", "Server selection settings"],
      ["added", "Real-time server status tracking"],
      ["improved", "Roster gold tracking functionality"],
    ],
  },
  {
    id: "9-10-2024-gold-tracking-fixes",
    date: "9/10/2024",
    title: "Gold Tracking Fixes & Server Status",
    description: "Fixed various gold tracking issues and enhanced server status monitoring.",
    details: [
      ["fixed", "Gold tracking for 6+ characters (temporary fix - first 6 characters)"],
      ["fixed", "Gold tracking for biweekly lockouts"],
      ["improved", "Server status tracking"],
      ["improved", "User interface"],
    ],
  },
  {
    id: "16-10-2024-gold-display-options-t4-items",
    date: "16/10/2024",
    title: "Gold Display Options & T4 Items",
    description: "Added display options for gold tracking and T4 tier items.",
    details: [
      ["added", "Toggle for remaining vs total earned gold display in roster tracking"],
      ["added", "T4 tier items to crafting and prices"],
      ["fixed", "Various raid rewards and item level adjustments"],
    ],
  },
  {
    id: "17-10-2024-character-tasks",
    date: "17/10/2024",
    title: "Character Tasks System",
    description: "Added a comprehensive task management system for characters.",
    details: [
      ["added", "Character task management system"],
      ["improved", "User interface"],
    ],
  },
  {
    id: "23-10-2024-aegir-raid",
    date: "23/10/2024",
    title: "Aegir Raid Support",
    description: "Added support for the new Aegir raid content.",
    details: [
      ["added", "Aegir raid content and rewards"],
    ],
  },
  {
    id: "26-10-2024-gold-earner-improvements",
    date: "26/10/2024",
    title: "Gold Earner System Improvements",
    description: "Enhanced the gold earner system with better character selection.",
    details: [
      ["added", "Gold earner checkbox in character form (removed 6 character limit)"],
      ["improved", "User interface"],
    ],
  },
  {
    id: "7-11-2024-compact-character-layout",
    date: "7/11/2024",
    title: "Compact Character Layout",
    description: "Added experimental compact layout for character cards and raid completion.",
    details: [
      ["added", "Experimental compact layout for character cards and raid completion"],
      ["improved", "User interface"],
    ],
  },
  {
    id: "4-12-2024-server-status-improvements",
    date: "4/12/2024",
    title: "Server Status Improvements",
    description: "Enhanced server status tracking and monitoring.",
    details: [
      ["improved", "Server status tracking accuracy"],
      ["improved", "User interface"],
    ],
  },
  {
    id: "9-12-2024-thaemine-g4-toggle",
    date: "9/12/2024",
    title: "Thaemine G4 Toggle Feature",
    description: "Added experimental toggle to ignore Thaemine if no G4 completion.",
    details: [
      ["added", "Toggle to ignore Thaemine without G4 for roster gold tracking and highest gold raid selection"],
      ["improved", "User interface"],
    ],
  },
  {
    id: "25-1-2025-crafting-kazeros-improvements",
    date: "25/1/2025",
    title: "Crafting & Kazeros Raid Improvements",
    description: "Major enhancements to crafting system and added Kazeros raid content.",
    details: [
      ["added", "Kazeros raid Brelshaza content"],
      ["improved", "Crafting system functionality"],
      ["improved", "Roster and character gold tracking"],
      ["fixed", "Legacy raid reward adjustments"],
    ],
  },
  {
    id: "2-2-2025-raid-rewards-adjustment",
    date: "2/2/2025",
    title: "Raid Rewards Adjustment",
    description: "Adjusted rewards for legacy raid content.",
    details: [
      ["fixed", "Legacy raid reward balancing"],
    ],
  },
  {
    id: "4-3-2025-mari-shop-prices",
    date: "4/3/2025",
    title: "Mari Shop Integration",
    description: "Added Mari's Secret Shop prices and quantities to the prices page.",
    details: [
      ["added", "Mari's Secret Shop prices and quantities"],
    ],
  },
  {
    id: "29-4-2025-exchange-rates-mari-shop",
    date: "29/4/2025",
    title: "Exchange Rates & Mari Shop Expansion",
    description: "Expanded Mari shop functionality and added exchange rates for various items.",
    details: [
      ["added", "Extended Mari's Secret Shop integration"],
      ["added", "Exchange rates for various items in prices store"],
      ["improved", "User interface"],
    ],
  },
  {
    id: "6-5-2025-ocr-server-improvements",
    date: "6/5/2025",
    title: "OCR Support & Server Improvements",
    description: "Added OCR support for faster price updating and enhanced server status.",
    details: [
      ["added", "OCR support for market screenshots (limited to life skill items)"],
      ["improved", "Server status monitoring"],
    ],
  },
  {
    id: "26-5-2025-stone-cutter-wildsoul",
    date: "26/5/2025",
    title: "Stone Cutter Tool & Wildsoul Class",
    description: "Added advanced stone cutting tool with screen sharing and new character class.",
    details: [
      ["added", "Stone cutter tool with screen sharing capability"],
      ["added", "Wildsoul character class"],
      ["improved", "User interface"],
    ],
  },
  {
    id: "31-5-2025-performance-theme-overhaul",
    date: "31/5/2025",
    title: "Performance & Theme Overhaul",
    description: "Major performance enhancements and complete UI/theme redesign.",
    details: [
      ["improved", "Application performance"],
      ["changed", "Complete UI and theme redesign"],
      ["improved", "Stone cutter tool accuracy"],
    ],
  },
  {
    id: "4-6-2025-mordum-raid-support",
    date: "4/6/2025",
    title: "Mordum Raid Support",
    description: "Added support for the new Mordum raid content.",
    details: [
      ["added", "Mordum raid content and rewards"],
    ],
  },
  {
    id: "10-6-2025-changelog-loa-logs-integration",
    date: "10/6/2025",
    title: "Changelog & LOA Logs Integration",
    description: "Added changelog page and automatic raid completion tracking via LOA Logs encounters.db file.",
    details: [
      ["added", "Changelog page for tracking updates"],
      ["added", "Automatic raid completion tracking via LOA Logs encounters.db file"],
    ],
  },
  {
    id: "11-6-2025-loa-logs-integration-fix",
    date: "11/6/2025",
    title: "LOA Logs Integration Fix",
    description: "Fixed issues with LOA Logs persistent file handle access and permissions.",
    details: [
      ["fixed", "Persistent file handle access for LOA Logs encounters.db"],
      ["improved", "Permission handling for LOA Logs file access"],
      ["improved", "User interface for LOA Logs integration"],
    ],
  },
  {
    id: "13-6-2025-loa-logs-integration-fix",
    date: "13/6/2025",
    title: "LOA Logs Integration Fix",
    description: "Fixed an issue that prevented the LOA Logs integration from reading large databases.",
    details: [
      ["fixed", "Issue with reading large databases in LOA Logs integration"],
      ["improved", "Performance of LOA Logs database queries"],
    ],
  },
  {
    id: "25-6-2025-solo-mode-friends-discord-raids-ui",
    date: "25/6/2025",
    title: "Solo Mode, Friends, Discord Auth & Raid Updates",
    description: "Added solo mode difficulty, Discord authentication, friend list and raid availability systems, updated old raid gold amounts, and various UI improvements.",
    details: [
      ["added", "Solo mode difficulty for raids"],
      ["added", "Discord authentication support"],
      ["added", "Friend list system"],
      ["added", "Friend raid availability system"],
      ["changed", "Updated old raid gold amounts"],
      ["improved", "User interface"],
    ],
  },
];
