# UI Polish Round 2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 6 UI issues: uneven task row margins, save button moved to bottom, card notes always editable, tighter top spacing, bigger text inputs, and a vertical card picker in TaskDetailScreen.

**Architecture:** Surgical edits to existing components. No new files. Changes flow from shared components (TaskRow, ScreenHeader, EditableTitle) outward to screen files (TaskDetailScreen, CardDetailScreen).

**Tech Stack:** React Native, NativeWind (Tailwind), Expo, Ionicons, TypeScript

---

### Task 1: Fix uneven bottom margin in TaskRow (list variant)

**Files:**
- Modify: `tandem-mobile/src/shared/components/ui/SwipeableTaskRow.tsx:119`

**Context:** The list-variant `TaskRow` has `mb-3` / `mb-1.5` baked into its root `TouchableOpacity`. Both `TasksScreen` and `CardDetailScreen` wrap each row in a `<View className="... mb-2">` that handles gap. The inner `mb` creates a visual gap *inside* the border at the bottom, making rows look bottom-heavy. Fix: strip `mb` from the row when `hideBackground=true` (the flag that signals a wrapper handles spacing).

**Step 1: Edit SwipeableTaskRow.tsx line 119**

Current (line 119):
```tsx
className={`${hideBackground ? '' : 'bg-surface shadow-sm ' + (overdue ? 'border border-red-200' : '')} ${hideCardName ? 'mb-1.5 py-1.5' : 'mb-3 py-3.5'} rounded-xl px-4`}
```

Change to:
```tsx
className={`${hideBackground ? '' : 'bg-surface shadow-sm ' + (overdue ? 'border border-red-200' : '')} ${hideBackground ? '' : hideCardName ? 'mb-1.5' : 'mb-3'} ${hideCardName ? 'py-1.5' : 'py-3.5'} rounded-xl px-4`}
```

This keeps `py` (vertical padding) always, but only applies `mb` when `hideBackground=false` (i.e., when the row itself is the card with no wrapper).

**Step 2: TypeScript check**

Run: `cd /Users/savannahbjorkman/dev/tandembicycle/tandem-mobile && npx tsc --noEmit 2>&1 | head -20`
Expected: no errors

**Step 3: Commit**

```bash
cd /Users/savannahbjorkman/dev/tandembicycle
git add tandem-mobile/src/shared/components/ui/SwipeableTaskRow.tsx
git commit -m "fix: remove inner mb from TaskRow when hideBackground=true to fix uneven card spacing"
```

---

### Task 2: Add `compact` prop to ScreenHeader, tighten EditableTitle top padding

**Files:**
- Modify: `tandem-mobile/src/shared/components/ui/ScreenHeader.tsx`
- Modify: `tandem-mobile/src/shared/components/ui/EditableTitle.tsx`

**Context:** Detail screens pass `title=""` to ScreenHeader — the header renders no text but still takes `pt-[60px] pb-5` (~100px of dead space before the title). Adding a `compact` prop swaps `pb-5` to `pb-1`. EditableTitle's `pt-2` is also cut to `pt-0`.

**Step 1: Add `compact` prop to ScreenHeader**

In `ScreenHeader.tsx`, update the interface and component:

```tsx
interface ScreenHeaderProps {
    title: string;
    showBack?: boolean;
    onBack?: () => void;
    rightAction?: React.ReactNode;
    className?: string;
    titleClassName?: string;
    compact?: boolean;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
    title,
    showBack,
    onBack,
    rightAction,
    className = '',
    titleClassName = '',
    compact = false,
}) => {
    return (
        <View className={`px-6 pt-[60px] ${compact ? 'pb-1' : 'pb-5'} flex-row justify-between items-end ${className}`}>
            ...rest unchanged...
        </View>
    );
};
```

**Step 2: Remove top padding from EditableTitle**

In `EditableTitle.tsx` line 28, change:
```tsx
<View className={`mb-6 pt-2 ${className}`}>
```
to:
```tsx
<View className={`mb-4 ${className}`}>
```

(Also reduce mb-6 to mb-4 to tighten spacing below the title.)

**Step 3: TypeScript check**

Run: `cd /Users/savannahbjorkman/dev/tandembicycle/tandem-mobile && npx tsc --noEmit 2>&1 | head -20`

**Step 4: Commit**

```bash
cd /Users/savannahbjorkman/dev/tandembicycle
git add tandem-mobile/src/shared/components/ui/ScreenHeader.tsx tandem-mobile/src/shared/components/ui/EditableTitle.tsx
git commit -m "fix: add compact prop to ScreenHeader, remove top padding from EditableTitle"
```

---

### Task 3: Apply `compact` to TaskDetailScreen + move save/delete to bottom row

**Files:**
- Modify: `tandem-mobile/src/features/tasks/screens/TaskDetailScreen.tsx`

**Context:** The CheckButton is currently in the ScreenHeader's `rightAction`. Move it to the bottom alongside the Delete button. Both sit in a horizontal `flex-row` at the bottom of the ScrollView. Pass `compact` to ScreenHeader to shrink the dead space at top.

**Step 1: Read the file first**

Read `/Users/savannahbjorkman/dev/tandembicycle/tandem-mobile/src/features/tasks/screens/TaskDetailScreen.tsx` to confirm current structure before editing.

**Step 2: Pass `compact` to ScreenHeader and remove rightAction**

Change:
```tsx
<ScreenHeader
    title=""
    showBack={false}
    onBack={handleSave}
    rightAction={isOwner ? <CheckButton onPress={handleSave} /> : undefined}
/>
```

To:
```tsx
<ScreenHeader
    title=""
    showBack={false}
    onBack={handleSave}
    compact
/>
```

**Step 3: Replace the bottom Delete button with a side-by-side Delete + Save row**

Remove the existing Delete button block:
```tsx
{/* Delete Button */}
{isOwner && (
    <TouchableOpacity
        onPress={handleDelete}
        className="flex-row items-center justify-center gap-2 py-4 mt-2 mb-10 bg-red-50 rounded-xl border border-red-100"
    >
        <Ionicons name="trash-outline" size={18} color="#dc2626" />
        <Text className="text-sm font-bold text-red-600">Delete Task</Text>
    </TouchableOpacity>
)}
<View className="h-10" />
```

Replace with:
```tsx
{isOwner && (
    <View className="flex-row gap-3 mt-2 mb-6">
        <TouchableOpacity
            onPress={handleDelete}
            className="flex-1 flex-row items-center justify-center gap-2 py-4 bg-red-50 rounded-xl border border-red-100"
        >
            <Ionicons name="trash-outline" size={18} color="#dc2626" />
            <Text className="text-sm font-bold text-red-600">Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={handleSave}
            className="flex-1 flex-row items-center justify-center gap-2 py-4 bg-primary-600 rounded-xl"
        >
            <Ionicons name="checkmark" size={18} color="white" />
            <Text className="text-sm font-bold text-white">Save</Text>
        </TouchableOpacity>
    </View>
)}
<View className="h-6" />
```

**Step 4: TypeScript check**

Run: `cd /Users/savannahbjorkman/dev/tandembicycle/tandem-mobile && npx tsc --noEmit 2>&1 | head -20`

**Step 5: Commit**

```bash
cd /Users/savannahbjorkman/dev/tandembicycle
git add tandem-mobile/src/features/tasks/screens/TaskDetailScreen.tsx
git commit -m "fix: TaskDetailScreen - compact header, move save+delete to bottom row"
```

---

### Task 4: Apply `compact` to CardDetailScreen + make notes always editable

**Files:**
- Modify: `tandem-mobile/src/features/cards/screens/CardDetailScreen.tsx`

**Context:** Card notes currently has a pencil-toggle edit mode. Remove the toggle; always show the TextInput (when isOwner). Auto-save on blur. Remove `isEditingNote` state. Also pass `compact` to ScreenHeader.

**Step 1: Read the file first**

Read `/Users/savannahbjorkman/dev/tandembicycle/tandem-mobile/src/features/cards/screens/CardDetailScreen.tsx`.

**Step 2: Pass `compact` to ScreenHeader**

Change:
```tsx
<ScreenHeader
    title=""
    showBack={false}
    onBack={() => navigation.goBack()}
    rightAction={
        isOwner ? (
            <View className="flex-row gap-2">
                <AddButton onPress={() => setShowAddTask(true)} />
            </View>
        ) : undefined
    }
/>
```

To:
```tsx
<ScreenHeader
    title=""
    showBack={false}
    onBack={() => navigation.goBack()}
    compact
    rightAction={
        isOwner ? (
            <AddButton onPress={() => setShowAddTask(true)} />
        ) : undefined
    }
/>
```

**Step 3: Remove `isEditingNote` state and `handleSaveNote` function**

Remove these lines near the top of the component:
```tsx
const [isEditingNote, setIsEditingNote] = useState(false);
```

Remove the `handleSaveNote` function:
```tsx
const handleSaveNote = () => {
    updateCard(card.name, { note: editNote });
    setIsEditingNote(false);
};
```

Replace `handleSaveNote` with an inline blur handler. The notes auto-save will happen via `onBlur`.

**Step 4: Replace the notes section**

Remove the entire current notes section:
```tsx
{/* Notes */}
<View className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm">
    <View className="flex-row justify-between items-center mb-2">
        <FieldLabel className="mb-0">Notes</FieldLabel>
        {isOwner && !isEditingNote && (
            <TouchableOpacity onPress={() => setIsEditingNote(true)}>
                <Ionicons name="pencil-outline" size={16} color={COLORS.text.muted} />
            </TouchableOpacity>
        )}
    </View>
    {isEditingNote ? (
        <View>
            <TextInput
                className="text-base text-text min-h-[80px] py-2"
                value={editNote}
                onChangeText={setEditNote}
                placeholder="Add notes about this card..."
                placeholderTextColor={COLORS.text.muted}
                multiline
                textAlignVertical="top"
                autoFocus
            />
            <View className="items-end mt-2">
                <CheckButton onPress={handleSaveNote} />
            </View>
        </View>
    ) : (
        <Text className="text-base text-text-secondary py-2">
            {card.note || ''}
        </Text>
    )}
</View>
```

Replace with:
```tsx
{/* Notes */}
<View className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm">
    <FieldLabel>Notes</FieldLabel>
    {isOwner ? (
        <TextInput
            className="text-base text-text py-2 min-h-[120px]"
            value={editNote}
            onChangeText={setEditNote}
            onBlur={() => updateCard(card.name, { note: editNote })}
            placeholder="Add notes about this card..."
            placeholderTextColor={COLORS.text.muted}
            multiline
            textAlignVertical="top"
        />
    ) : (
        <Text className="text-base text-text-secondary py-2">{card.note || 'No notes'}</Text>
    )}
</View>
```

**Step 5: Remove unused imports**

- Remove `CheckButton` from the `@shared/components/ui` import if it's no longer used elsewhere in the file.
- Verify `Ionicons` is still used (for the lock icon in the not-owner banner and archive icon) — keep it.

**Step 6: TypeScript check**

Run: `cd /Users/savannahbjorkman/dev/tandembicycle/tandem-mobile && npx tsc --noEmit 2>&1 | head -20`

**Step 7: Commit**

```bash
cd /Users/savannahbjorkman/dev/tandembicycle
git add tandem-mobile/src/features/cards/screens/CardDetailScreen.tsx
git commit -m "fix: CardDetailScreen - compact header, notes always editable with auto-save on blur"
```

---

### Task 5: Enlarge notes TextInput in TaskDetailScreen

**Files:**
- Modify: `tandem-mobile/src/features/tasks/screens/TaskDetailScreen.tsx`

**Context:** Notes text input is `min-h-[80px]` which feels cramped. Increase to `min-h-[120px]` and add a subtle background and border to make it feel like a proper input area.

**Step 1: Update notes TextInput styling**

Find (around line 187):
```tsx
<TextInput
    className="text-base text-text py-2 min-h-[80px]"
    value={editNote}
    onChangeText={setEditNote}
    placeholder="Add notes..."
    placeholderTextColor={COLORS.text.muted}
    multiline
    textAlignVertical="top"
/>
```

Replace with:
```tsx
<TextInput
    className="text-base text-text py-2 min-h-[120px]"
    value={editNote}
    onChangeText={setEditNote}
    placeholder="Add notes..."
    placeholderTextColor={COLORS.text.muted}
    multiline
    textAlignVertical="top"
/>
```

**Step 2: TypeScript check**

Run: `cd /Users/savannahbjorkman/dev/tandembicycle/tandem-mobile && npx tsc --noEmit 2>&1 | head -20`

**Step 3: Commit**

```bash
cd /Users/savannahbjorkman/dev/tandembicycle
git add tandem-mobile/src/features/tasks/screens/TaskDetailScreen.tsx
git commit -m "fix: increase notes TextInput min-height from 80px to 120px in TaskDetailScreen"
```

---

### Task 6: Replace ChipGroup card picker with vertical scrollable list in TaskDetailScreen

**Files:**
- Modify: `tandem-mobile/src/features/tasks/screens/TaskDetailScreen.tsx`

**Context:** The horizontal scrollable `ChipGroup` for card selection is replaced with a vertical list of tappable rows — each showing the card name and a filled/outline circle on the right to indicate selection. Wrapped in a `ScrollView` with `maxHeight: 200` so it scrolls if there are many cards.

**Step 1: Add ScrollView to react-native imports**

In TaskDetailScreen.tsx, the import from react-native already has `ScrollView` — confirm it's there:
```tsx
import { View, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
```
If `ScrollView` is missing, add it.

**Step 2: Replace the Card Assignment section**

Find:
```tsx
{/* Card Assignment */}
<View className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm">
    <FieldLabel>Card</FieldLabel>
    {isOwner ? (
        <ChipGroup
            options={cardOptions}
            value={editCard}
            onChange={setEditCard}
            scrollable
        />
    ) : (
        <Text className="text-base text-text py-2">{task.card}</Text>
    )}
</View>
```

Replace with:
```tsx
{/* Card Assignment */}
<View className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm">
    <FieldLabel>Card</FieldLabel>
    {isOwner ? (
        <ScrollView
            style={{ maxHeight: 200 }}
            scrollEnabled
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
        >
            {cardOptions.map((option, index) => (
                <TouchableOpacity
                    key={option.key}
                    onPress={() => setEditCard(option.key)}
                    className={`flex-row items-center justify-between py-3 ${index < cardOptions.length - 1 ? 'border-b border-border-light' : ''}`}
                >
                    <Text className={`text-base ${editCard === option.key ? 'text-primary-600 font-semibold' : 'text-text'}`}>
                        {option.label}
                    </Text>
                    <Ionicons
                        name={editCard === option.key ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={editCard === option.key ? COLORS.primary[600] : COLORS.text.muted}
                    />
                </TouchableOpacity>
            ))}
        </ScrollView>
    ) : (
        <Text className="text-base text-text py-2">{task.card}</Text>
    )}
</View>
```

**Step 3: Remove unused ChipGroup import if no longer used**

Check if `ChipGroup` is still imported and used elsewhere in `TaskDetailScreen.tsx`. If not, remove it from the import:
```tsx
import { Text, ScreenHeader, FieldLabel, DatePickerSheet, EmptyState, EditableTitle, TextInput, CheckButton } from '@shared/components/ui';
```
(Remove `ChipGroup` from this list if it's gone from the JSX.)

**Step 4: TypeScript check**

Run: `cd /Users/savannahbjorkman/dev/tandembicycle/tandem-mobile && npx tsc --noEmit 2>&1 | head -20`

**Step 5: Commit**

```bash
cd /Users/savannahbjorkman/dev/tandembicycle
git add tandem-mobile/src/features/tasks/screens/TaskDetailScreen.tsx
git commit -m "feat: replace ChipGroup card picker with vertical scrollable radio list in TaskDetailScreen"
```
