// The note every new user starts with: a short, editable tour of the app.

export const WELCOME_TITLE = "Welcome to Webnotes";
export const WELCOME_ICON = "👋";

export function welcomeContent(signedIn: boolean) {
  const saving = signedIn
    ? "Everything saves as you type, and shows up in your other tabs straight away."
    : "Notes save on this device as you type. Create an account when you want to keep them anywhere.";

  const extras = signedIn
    ? `- **Share:** use Share at the top right to get a link. Add a password or an expiry, or reset the link any time.
- **Images:** paste or drop a picture into a note, or type \`/image\`.`
    : `- **Share:** turn a note into a link, with an optional password and expiry. This needs a free account.
- **Images:** paste or drop a picture into a note. This needs a free account too.`;

  return `This note is a quick tour. Edit it, delete it or keep it around.

## Write

Press \`/\` on an empty line to add a heading, list, to-do list, quote, code block or divider. Select any text to format it: bold, italic, underline, strikethrough, code, highlight or a link.

Give it a go:

- [ ] Type \`/\` below and add a heading
- [ ] Select this line and make it bold
- [ ] Tick this box

## Faster formatting

These work as you type, followed by a space:

- \`#\` for a heading
- \`-\` for a bullet list
- \`[]\` for a to-do
- \`>\` for a quote

> Press Ctrl or Cmd with B, I or U for bold, italic and underline.

## Stay organized

- Star a note to pin it under Favorites.
- Search your notes by title from the sidebar.
- Pick an emoji above the title to give a note an icon.
- Deleted notes wait in Trash until you empty it.

## Share and add images

${extras}

## Saving

${saving}

Open **Guide** in the top bar any time to see the tour again.
`;
}
