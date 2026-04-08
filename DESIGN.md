# Design System

Attendance management SaaS. White-based, business-grade interface built on Mantine UI.
Clean, high information density, low visual noise. Rich but not flashy.

---

## 1. Color Tokens

### Primary (Blue)

| Token | Value | Usage |
|-------|-------|-------|
| blue.0 | #e7f0ff | Selected row bg, active state tint |
| blue.1 | #ccdcff | Hover bg |
| blue.5 | #3370ff | Button hover |
| blue.6 | #2665fd | CTA buttons, active nav, links |
| blue.8 | #0a3282 | Button pressed |

### Accent (Teal)

| Token | Value | Usage |
|-------|-------|-------|
| teal.0 | #e6fcf5 | Success notification bg, approval badge bg |
| teal.6 | #0ca678 | Success text, approval badge, clock-in button |
| teal.8 | #087f5b | Success text emphasis |

### Semantic

| Token | Value | Usage |
|-------|-------|-------|
| Error | #e03131 | Validation errors, rejection badge, suspend button |
| Warning | #f08c00 | Pending badge, caution alerts |
| Info | #1c7ed6 | Informational alerts |

### Neutral

| Token | CSS Variable | Value | Usage |
|-------|-------------|-------|-------|
| Background | --app-bg | #ffffff | Page background |
| Surface | --app-surface | #f8f9fa | Card bg, sidebar bg, striped table rows |
| Surface Strong | --app-surface-strong | #f1f3f5 | Filter bar bg, section dividers |
| Border | --app-border | #dee2e6 | Card borders, input borders, dividers |
| Border Light | --app-border-light | #e9ecef | Table row separators |
| Text Primary | --app-text | #212529 | Headings, body text |
| Text Secondary | --app-text-secondary | #495057 | Supporting text |
| Text Muted | --app-text-muted | #868e96 | Labels, placeholders, timestamps |

---

## 2. Typography

| Element | Font | Size | Weight | Notes |
|---------|------|------|--------|-------|
| Page title | Inter | 22px | 700 | letter-spacing: -0.02em |
| Section heading | Inter | 16px | 600 | Inside cards |
| Body | Inter | 14px | 400 | Default |
| Label | Inter | 13px | 500 | Form input labels |
| Caption | Inter | 12px | 400 | Table footnotes, record counts |
| Eyebrow | Inter | 11px | 700 | uppercase, letter-spacing: 0.1em, color: --app-text-muted |
| Time values | JetBrains Mono | 14px | 400 | Clock-in/out times, work hours. Apply class .mono |
| KPI number | Inter | 28px | 700 | Dashboard large numbers |

---

## 3. Mantine Theme

Apply once at MantineProvider level. All pages inherit automatically.

- primaryColor: blue
- fontFamily: Inter, -apple-system, BlinkMacSystemFont, sans-serif
- fontFamilyMonospace: JetBrains Mono, ui-monospace, monospace
- defaultRadius: sm
- white: #ffffff
- black: #212529
- Custom blue palette: blue.0 through blue.9 matching the tokens above
- headings fontFamily: same as body, fontWeight: 700

### Component Defaults

| Component | Default Props |
|-----------|--------------|
| Button | radius: sm, fontWeight: 600 |
| TextInput | radius: sm |
| PasswordInput | radius: sm |
| Select | radius: sm |
| DatePickerInput | radius: sm |
| Textarea | radius: sm |
| Card | radius: md, withBorder: true, shadow: none, padding: lg |
| Table | striped: true, highlightOnHover: true, verticalSpacing: sm |
| Badge | radius: sm, variant: light |
| Modal | radius: md, centered: true |
| Notification | radius: sm |
| Pagination | radius: sm |
| Menu | radius: sm, shadow: md |
| Tabs | radius: sm |

---

## 4. Layout

### 4.1 AppShell (Authenticated Frame)

All authenticated pages share a single AppShell. No page should rebuild header or sidebar.

- Header: height 60, bg white, border-bottom 1px solid --app-border, px md
- Navbar: width 260, bg --app-surface, border-right 1px solid --app-border, collapsible below sm breakpoint
- Main: bg white, padding 24px

Header left side: Burger (mobile only), brand logo (icon + "attendance" text), role badge (Badge variant light color blue).
Header right side: tenant chip (pill shape, bg --app-surface, shows tenant name), user menu (Avatar + name + dropdown with logout).

### 4.2 Navbar

Top section: eyebrow label "MENU" (uppercase, 11px, 700, muted color).
Below: NavLink list, one per menu item. Each NavLink has an icon (size 18, stroke 1.5) and label.

NavLink states:
- Default: bg transparent, color --app-text-secondary, border-radius sm
- Hover: bg --app-surface-strong
- Active: bg blue.0, color blue.6, font-weight 600, left accent bar 3px solid blue.6

Nav items are role-dependent. Only show items relevant to the current user role.

### 4.3 PageLayout (Every Page Wrapper)

Every page inside Main uses a PageLayout wrapper. It accepts: title, optional description, optional actions, optional filters, and children.

- Max width: 1200px, centered horizontally
- Page header: Title (22px, 700, letter-spacing -0.02em) on the left, action buttons on the right. No card decoration on the header — just text and buttons
- Optional description below title: size sm, color dimmed
- Optional filter bar: bg --app-surface, border-radius sm, padding sm. Contains Select, DatePickerInput, etc.
- Children: the main content area

---

## 5. Component Patterns

### 5.1 Buttons

| Type | Variant | Color | Usage |
|------|---------|-------|-------|
| Primary | filled | blue (default) | CTA: create, save, clock-in |
| Secondary | light | blue (default) | Supporting actions: filter reset, break start |
| Outline | outline | blue (default) | Cancel, go back |
| Danger | light | red | Suspend, deactivate, delete |
| Success | filled | teal | Approve, resume |
| Ghost | subtle | blue (default) | In-table action links |

Placement rules:
- Page header actions: right-aligned. Icon in leftSection (size 16).
- Form submit: bottom of form, right-aligned via Group justify flex-end.
- Table row actions: use variant subtle for single action, Menu dropdown for multiple.
- Destructive actions: always require a confirmation modal first.
- All submit buttons must have loading prop bound to mutation pending state.

### 5.2 Tables (List Pages)

Wrap the Table inside a Card with padding 0 so the table stretches edge to edge.

Table uses Mantine Table with striped and highlightOnHover. TanStack Table handles sorting, filtering, pagination logic.

- Header row: bg --app-surface, font-size 13px, font-weight 600, color --app-text-muted
- Striped rows: alternating bg --app-surface
- Time columns: apply .mono class
- Status columns: use StatusBadge component
- Name + subtitle pattern: Stack with gap 2. Top line: Text fw 600. Bottom line: Text size xs, color dimmed.
- Action column: single action uses Button variant subtle. Multiple actions use Menu dropdown.

Pagination sits outside the Card, below it with mt md. Left side shows total count (Text size sm, color dimmed). Right side shows Pagination component.

### 5.3 Forms (Create / Edit Pages)

Form lives inside a Card with withBorder, shadow none, max width 640px.

- Labels above inputs (Mantine default)
- Field gap: md (16px)
- Section dividers: use Mantine Divider between logical groups
- Bottom of form: Group justify flex-end with Cancel (variant outline) and Submit (variant filled, loading bound to pending state)
- Validation errors: use Mantine error prop on each input, shows red text below the field
- Use react-hook-form + zod for form state and validation

### 5.4 Status Badges

All status indicators use Badge variant light. Consistent across the entire app.

| Status | Color | Label (JP) |
|--------|-------|-----------|
| active | teal | 稼働中 |
| suspended | red | 停止中 |
| approved | teal | 承認済み |
| pending | yellow | 申請中 |
| rejected | red | 差し戻し |
| working | blue | 勤務中 |
| completed | teal | 退勤済み |
| holiday | grape | 休暇 |
| absent | gray | 欠勤 |
| closed | teal | 締め済み |
| tenant_admin | blue | 管理者 |
| tenant_user | gray | 一般 |
| system_admin | dark | システム管理者 |

### 5.5 KPI Cards (Dashboard / Clock Page)

Used for at-a-glance metrics. Arranged in SimpleGrid cols base 1, sm 2, md 3, spacing md.

Each card: Card withBorder, shadow none.
- Label: size xs, uppercase, fw 700, color dimmed
- Value: fz 28, fw 700. Time values use .mono class.
- Subtitle: size sm, color dimmed

### 5.6 Modals (Confirmation Dialogs)

All destructive or significant actions require a confirmation modal.

- centered: true
- Title: clearly states the action (e.g. "Suspend Tenant")
- Body: Text size sm explaining the impact
- Footer: Group justify flex-end. Cancel (variant outline) + Confirm (color red for destructive, teal for positive). Confirm button has loading prop.

### 5.7 Notifications (Toasts)

Use Mantine notifications.show(). Always include title and message.

| Type | Color | When |
|------|-------|------|
| Success | teal | Create, update, approve completed |
| Error | red | API failure, validation error |
| Warning | yellow | Action completed with caveats |
| Info | blue | General notification |

### 5.8 Loading and Empty States

Loading: Center with min-height 200px containing a Loader color blue.

Empty state: Card withBorder, shadow none. Center with min-height 200px. Stack aligned center with ThemeIcon (size 48, radius xl, variant light, color gray) containing an appropriate icon, and Text size sm color dimmed with a message.

### 5.9 Alerts

- Error: Alert color red, variant light, icon IconAlertCircle size 16
- Info: Alert color blue, variant light, icon IconInfoCircle size 16
- Warning: Alert color yellow, variant light, icon IconAlertTriangle size 16

---

## 6. Page Templates

### 6.1 List Page (Tenants, Users, Attendance)

Structure: PageLayout with title, action button (top right, leftSection icon), optional filter bar, Card with padding 0 containing DataTable, pagination below the card.

Filter bar contains Select dropdowns and DatePickerInput as needed. Each filter has a fixed width (around 200-280px).

### 6.2 Create / Edit Page

Structure: PageLayout with title. Single Card with max width 640px containing a form. Stack gap md for fields. Divider before the button row. Buttons right-aligned: Cancel (outline) + Submit (filled, loading).

### 6.3 Detail Page

Structure: PageLayout with title (entity name), optional description (entity ID), action buttons top right.

Content: SimpleGrid cols base 1, md 2, spacing md. Each section is a Card with a section heading (Text size xs, fw 600, color dimmed, mb sm) followed by detail rows.

Detail row: Group justify space-between. Left: Text size sm, color dimmed (label). Right: Text size sm, fw 500 (value). StatusBadge for status fields.

### 6.4 Clock Page (Action Dashboard)

Structure: PageLayout with title. KPI cards in SimpleGrid (3 cols). Below: an action Card with current record summary and action buttons (clock-in, break start/end, clock-out).

Action buttons change based on current attendance state. Only show relevant actions.

---

## 7. Login Page

Standalone layout. Does not use AppShell.

Two-column layout: left side has marketing copy, right side has login card.
- Left: eyebrow text, large headline (clamp 2.5rem to 4.75rem), description text, feature highlights (icon + title + description in bordered cards)
- Right: Card with bg white, border 1px solid --app-border, border-radius 16px, padding 32px, subtle box-shadow (0 24px 80px rgba 15 23 42 0.06). Contains Google login button (full width, variant default, pill shape) + divider + email/password form.

Background: white base with subtle blue radial gradient at top-left corner.

Mobile: collapses to single column, card stacks below copy.

---

## 8. Spacing

| Location | Value |
|----------|-------|
| Main padding | 24px |
| Card internal padding | lg (20px) |
| Card-to-card gap | md (16px) |
| Form field gap | md (16px) |
| Table row vertical spacing | sm (12px) |
| Page title to content | lg (20px) |
| Button-to-button gap | sm (12px) |
| Content max width | 1200px |
| Form card max width | 640px |

---

## 9. Responsive

| Breakpoint | Changes |
|-----------|---------|
| Below sm (768px) | Navbar hidden (Burger toggle), Main padding 16px, SimpleGrid 1 col |
| Below md (992px) | SimpleGrid 2 cols |
| lg (1200px) and above | Full layout |

---

## 10. Icons

Use Tabler Icons (@tabler/icons-react) exclusively.

| Usage | Size | Stroke |
|-------|------|--------|
| Nav links | 18 | 1.5 |
| Button leftSection | 16 | default |
| Empty state (inside ThemeIcon) | 24 | default |
| Alerts | 16 | default |
| User menu items | 16 | default |

---

## 11. Do / Don't

Do:
- Set all visual defaults at MantineProvider theme level once. No per-page overrides.
- Use AppShell for the global frame. Pages only provide content inside PageLayout.
- Wrap tables in Card with padding 0.
- Use StatusBadge for all status displays.
- Require confirmation modals for destructive actions.
- Bind loading prop to all submit buttons.
- Apply .mono class to all time values.
- Use CSS variables or Mantine tokens for colors. Never hardcode hex in inline styles.

Don't:
- Add shadow to cards. Use withBorder only for separation.
- Rebuild header or sidebar per page.
- Use primary blue for status indicators or decorative elements.
- Place a filled red button without a confirmation step.
- Mix rounded and sharp corners in the same view.
- Use inline styles for colors. Always reference tokens.
