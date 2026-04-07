# Design System

## Overview

A clean, white-based interface for an attendance management SaaS.
Built on Mantine UI. Prioritizes layout-level styling to reduce per-page effort.
High information density, low visual noise, business-appropriate tone.

## Colors

| Token        | Value     | Usage                                      |
| ------------ | --------- | ------------------------------------------ |
| Primary      | `#2665fd` | CTAs, active nav, key interactive elements |
| Secondary    | `#475569` | Supporting text, chips, secondary actions  |
| Background   | `#ffffff` | Page background                            |
| Surface      | `#f8f9fa` | Cards, sidebar, table rows (alt)           |
| Border       | `#dee2e6` | Dividers, input borders, card borders      |
| Text Primary | `#1a1a2e` | Headings, body text                        |
| Text Muted   | `#6b7280` | Labels, placeholders, secondary text       |
| Error        | `#e03131` | Validation errors, destructive actions     |
| Success      | `#2f9e44` | Success states, approval badges            |
| Warning      | `#f08c00` | Pending states, attention badges           |

## Typography

- Headlines: Inter, semi-bold, 18–24px
- Body: Inter, regular, 14px
- Labels: Inter, medium, 12px, uppercase for section headers
- Monospace (time values): JetBrains Mono or system monospace, 14px

## Mantine Theme Override

Apply once at `MantineProvider` level. All pages inherit automatically.

```ts
const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Inter, sans-serif',
  defaultRadius: 'sm',
  colors: {
    blue: [
      '#e7f0ff', '#ccdcff', '#99b8ff', '#6694ff',
      '#3370ff', '#2665fd', '#1a54d4', '#1243ab',
      '#0a3282', '#042159',
    ],
  },
  components: {
    Button: { defaultProps: { radius: 'sm' } },
    Input: { defaultProps: { radius: 'sm' } },
    Card: { defaultProps: { radius: 'sm', withBorder: true, shadow: 'none' } },
    Table: { defaultProps: { striped: true, highlightOnHover: true } },
    Badge: { defaultProps: { radius: 'sm', variant: 'light' } },
  },
});
```

## Layout Architecture

Design at the layout level so individual pages only provide content.

### AppShell (Global Layout)

Use Mantine `AppShell` as the single outer frame for all authenticated pages.

```
┌─────────────────────────────────────────────┐
│  Header (60px)                              │
│  Logo | Nav Tabs | Tenant Name | User Menu  │
├────────┬────────────────────────────────────┤
│Sidebar │  Main Content                      │
│(240px) │                                    │
│        │  ┌─ Page Header ─────────────────┐ │
│ Nav    │  │ Title + Actions               │ │
│ Links  │  └───────────────────────────────┘ │
│        │                                    │
│        │  ┌─ Content Area ────────────────┐ │
│        │  │                               │ │
│        │  │                               │ │
│        │  └───────────────────────────────┘ │
└────────┴────────────────────────────────────┘
```

- Header: `bg: white`, bottom border `#dee2e6`, height `60px`
- Sidebar: `bg: #f8f9fa`, right border, width `240px`, collapsible
- Main: `bg: #ffffff`, padding `24px`

### Page Template

Every page follows this structure inside the main content area:

```
PageHeader  →  Title (h2) + action buttons (right-aligned)
Filters     →  Optional filter bar (Group of Select/DatePicker)
Content     →  Table / Form / Dashboard cards
Pagination  →  Bottom-aligned, right
```

Wrap this as a reusable `PageLayout` component:

```tsx
function PageLayout({ title, actions, filters, children }: PageLayoutProps) {
  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>{title}</Title>
        <Group>{actions}</Group>
      </Group>
      {filters && <Group>{filters}</Group>}
      {children}
    </Stack>
  );
}
```

## Component Patterns

### Tables (Attendance, Employee lists)

- Use Mantine `Table` with `striped` and `highlightOnHover`
- TanStack Table for sorting, filtering, pagination logic
- Time values in monospace font
- Status columns use `Badge` with semantic colors

### Forms (Clock correction, Leave request, Approval)

- Mantine form inputs inside `Card withBorder shadow="none"`
- Labels above inputs, not inline
- Submit button: primary blue, right-aligned
- Destructive actions: red outline variant

### Status Badges

| Status   | Color   | Example          |
| -------- | ------- | ---------------- |
| Approved | green   | `variant="light"` |
| Pending  | yellow  | `variant="light"` |
| Rejected | red     | `variant="light"` |
| Draft    | gray    | `variant="light"` |

### Cards (Dashboard)

- `Card withBorder shadow="none" radius="sm"`
- Use `SimpleGrid cols={3}` for dashboard KPI cards
- Consistent internal padding `p="lg"`

## Spacing & Grid

- Page padding: `24px`
- Card gap: `16px`
- Form field gap: `12px`
- Use Mantine `Stack` (vertical) and `Group` (horizontal) for layout
- Grid: `SimpleGrid` or `Grid` with responsive breakpoints

## Do's and Don'ts

- Do apply all visual defaults at `MantineProvider` theme level
- Do use `AppShell` for the global frame — never rebuild header/sidebar per page
- Do use `PageLayout` wrapper so every page gets consistent title + actions
- Do use `Badge variant="light"` for all status indicators
- Don't add `shadow` to cards — rely on border for separation
- Don't mix rounded and sharp corners in the same view
- Don't use primary blue for secondary or passive elements
- Do maintain 4.5:1 contrast ratio for all text on white background
