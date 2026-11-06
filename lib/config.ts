export const EVENT = {
  budget: "$15",
  exchangeDate: "Friday, December 11",
  exchangeTime: "6:00 PM",
  exchangeLocation: "GrizzHacks HQ",
  orgName: "GrizzHacks",
  // The short paragraph shown on the revealed letter.
  message:
    "Keep it secret until the exchange! Wrap your gift, tag it with their name only, and bring it to HQ. Not sure what they’d like? Ask around — quietly.",
} as const;

// Shaped for <Letter details={...}>. Kept here so components never hard-code event info.
export const LETTER_DETAILS = [
  { label: "Budget", value: EVENT.budget },
  { label: "When", value: `${EVENT.exchangeDate} · ${EVENT.exchangeTime}` },
  { label: "Where", value: EVENT.exchangeLocation },
] as const;
