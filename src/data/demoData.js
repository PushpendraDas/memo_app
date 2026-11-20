import { createId } from '../utils/id'

/** Builds the demo content shown on the very first launch only. */
export function createDemoData(now = Date.now()) {
  const minutes = (n) => now - n * 60 * 1000
  const work = { id: createId('cat'), name: 'Work', color: 'indigo', createdAt: minutes(60 * 24 * 6) }
  const personal = { id: createId('cat'), name: 'Personal', color: 'emerald', createdAt: minutes(60 * 24 * 6) }
  const ideas = { id: createId('cat'), name: 'Ideas', color: 'amber', createdAt: minutes(60 * 24 * 6) }

  const note = (fields) => ({
    id: createId('note'),
    categoryId: null,
    color: 'default',
    favorite: false,
    pinned: false,
    archived: false,
    trashed: false,
    trashedAt: null,
    ...fields,
  })

  const notes = [
    note({
      title: 'Welcome to MemoSpace 👋',
      content:
        'MemoSpace is your calm, fast home for notes.\n\n• Press Ctrl/Cmd + N (or Alt + N) to create a note\n• Press Ctrl/Cmd + K to jump to search\n• Pin important notes so they stay on top\n• Star favorites, archive what you are done with\n• Deleted notes go to Trash first, so nothing is lost by accident\n\nEverything is saved automatically in your browser.',
      color: 'blue',
      pinned: true,
      favorite: true,
      createdAt: minutes(5),
      updatedAt: minutes(5),
    }),
    note({
      title: 'Q4 product roadmap',
      content:
        'Priorities for the quarter:\n1. Ship the new onboarding flow\n2. Improve search performance\n3. Launch the mobile beta\n\nSync with design on Thursday.',
      categoryId: work.id,
      color: 'purple',
      pinned: true,
      createdAt: minutes(60 * 26),
      updatedAt: minutes(60 * 3),
    }),
    note({
      title: 'Weekend groceries',
      content: 'Avocados\nSourdough bread\nGreek yogurt\nFresh basil\nOlive oil\nDark chocolate',
      categoryId: personal.id,
      color: 'green',
      createdAt: minutes(60 * 30),
      updatedAt: minutes(42),
    }),
    note({
      title: 'App idea: habit garden',
      content:
        'A habit tracker where every streak grows a plant. Missing a day makes it wilt a little — not die. Gentle accountability.',
      categoryId: ideas.id,
      color: 'yellow',
      favorite: true,
      createdAt: minutes(60 * 24 * 3),
      updatedAt: minutes(60 * 24 * 2),
    }),
    note({
      title: 'Meeting notes — design review',
      content:
        'Attendees: Priya, Marco, Lena\n\n- Card shadows feel too heavy, soften them\n- Dark mode contrast approved\n- Follow up on empty-state illustrations',
      categoryId: work.id,
      createdAt: minutes(60 * 24 * 4),
      updatedAt: minutes(60 * 24 * 4),
    }),
    note({
      title: 'Books to read',
      content: 'The Design of Everyday Things\nDeep Work\nA Philosophy of Software Design\nThe Overstory',
      categoryId: personal.id,
      color: 'pink',
      createdAt: minutes(60 * 24 * 5),
      updatedAt: minutes(60 * 24 * 5),
    }),
    note({
      title: 'Old travel checklist',
      content: 'Passport, chargers, adapters, headphones, snacks.',
      categoryId: personal.id,
      color: 'orange',
      archived: true,
      createdAt: minutes(60 * 24 * 20),
      updatedAt: minutes(60 * 24 * 18),
    }),
  ]

  return { notes, categories: [work, personal, ideas] }
}
