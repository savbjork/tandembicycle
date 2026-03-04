# UI Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Five targeted UI improvements across task/card detail screens, auth screens, and the shared ScreenHeader.

**Architecture:** All changes are isolated to existing screen files and one shared component (`ScreenHeader`). No new components needed. Each task is independent and can be committed separately.

**Tech Stack:** React Native, NativeWind (Tailwind classes), `@react-navigation/native-stack`, existing shared components (`BottomSheet`, `DatePickerSheet`, `TextInput`, `ScreenHeader`).

---

### Task 1: Reduce compact header top padding (ScreenHeader)

**Files:**
- Modify: `tandem-mobile/src/shared/components/ui/ScreenHeader.tsx:31`

**Step 1: Locate the padding line**

Open `tandem-mobile/src/shared/components/ui/ScreenHeader.tsx`. Find line 31:
```tsx
<View className={`px-6 pt-[60px] ${compact ? 'pb-1' : 'pb-5'} flex-row justify-between items-end ${className}`}>
```

**Step 2: Apply the fix**

Change the className to reduce top padding in compact mode:
```tsx
<View className={`px-6 ${compact ? 'pt-[44px] pb-1' : 'pt-[60px] pb-5'} flex-row justify-between items-end ${className}`}>
```

**Step 3: Verify manually**

Run the app and open a Task Detail and a Card Detail. The title should sit noticeably closer to the top of the screen with adequate safe-area clearance.

**Step 4: Commit**
```bash
git add tandem-mobile/src/shared/components/ui/ScreenHeader.tsx
git commit -m "fix: reduce compact header top padding from 60px to 44px"
```

---

### Task 2: Autoscroll to notes on focus (TaskDetailScreen)

**Files:**
- Modify: `tandem-mobile/src/features/tasks/screens/TaskDetailScreen.tsx`

**Step 1: Add ScrollView ref and layout tracking**

At the top of the file, import `useRef` and update the `ScrollView` import to include `ScrollView` as a named type:
```tsx
import React, { useState, useMemo, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
```

Inside the component, add:
```tsx
const scrollViewRef = useRef<ScrollView>(null);
const noteInputY = useRef<number>(0);
```

**Step 2: Attach ref to ScrollView**

Find the `<ScrollView` at line 108 and add the ref:
```tsx
<ScrollView
    ref={scrollViewRef}
    className="flex-1 px-5 pb-5"
    keyboardShouldPersistTaps="handled"
>
```

**Step 3: Add onLayout to the Notes section container**

Find the Notes `<View>` wrapper (line 200). Add `onLayout`:
```tsx
<View
    className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm"
    onLayout={(e) => { noteInputY.current = e.nativeEvent.layout.y; }}
>
```

**Step 4: Add onFocus to the notes TextInput**

Find the notes `<TextInput>` (line 203). Add `onFocus`:
```tsx
<TextInput
    className="text-base text-text py-2 min-h-[120px]"
    value={editNote}
    onChangeText={setEditNote}
    placeholder="Add notes..."
    placeholderTextColor={COLORS.text.muted}
    multiline
    textAlignVertical="top"
    onFocus={() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: noteInputY.current, animated: true });
        }, 100);
    }}
/>
```

The `setTimeout` of 100ms gives the keyboard time to begin appearing before scrolling.

**Step 5: Verify manually**

Open a task detail. Scroll up so notes are off-screen. Tap the notes field. The view should scroll to show the notes input above the keyboard.

**Step 6: Commit**
```bash
git add tandem-mobile/src/features/tasks/screens/TaskDetailScreen.tsx
git commit -m "fix: autoscroll to notes field on focus in TaskDetailScreen"
```

---

### Task 3: Autoscroll to notes on focus (CardDetailScreen)

**Files:**
- Modify: `tandem-mobile/src/features/cards/screens/CardDetailScreen.tsx`

**Step 1: Add ScrollView ref and layout tracking**

Add `useRef` to the React import:
```tsx
import React, { useState, useMemo, useRef } from 'react';
```

Inside the component (after the `card` null check), add:
```tsx
const scrollViewRef = useRef<ScrollView>(null);
const noteInputY = useRef<number>(0);
```

**Step 2: Attach ref to ScrollView**

Find the `<ScrollView` at line 119 and add the ref:
```tsx
<ScrollView ref={scrollViewRef} className="flex-1 px-5 pb-5" keyboardShouldPersistTaps="handled">
```

**Step 3: Add onLayout to Notes container**

Find the Notes `<View>` wrapper (line 185). Add `onLayout`:
```tsx
<View
    className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm"
    onLayout={(e) => { noteInputY.current = e.nativeEvent.layout.y; }}
>
```

**Step 4: Add onFocus to notes TextInput**

Find the notes `<TextInput>` (line 188). Add `onFocus`:
```tsx
<TextInput
    className="text-base text-text py-2 min-h-[120px]"
    value={editNote}
    onChangeText={setEditNote}
    placeholder="Add notes..."
    placeholderTextColor={COLORS.text.muted}
    multiline
    textAlignVertical="top"
    onFocus={() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: noteInputY.current, animated: true });
        }, 100);
    }}
/>
```

**Step 5: Verify manually**

Open a card detail. Tap the notes field. The view should scroll to reveal the notes input.

**Step 6: Commit**
```bash
git add tandem-mobile/src/features/cards/screens/CardDetailScreen.tsx
git commit -m "fix: autoscroll to notes field on focus in CardDetailScreen"
```

---

### Task 4: Card selection bottom sheet (TaskDetailScreen)

**Files:**
- Modify: `tandem-mobile/src/features/tasks/screens/TaskDetailScreen.tsx`

**Step 1: Add card picker sheet state**

Inside the component, add:
```tsx
const [showCardPicker, setShowCardPicker] = useState(false);
```

**Step 2: Replace the embedded card list with a tappable row**

Find the Card Assignment `<View>` section (lines 130–158). Replace the entire block with:
```tsx
{/* Card Assignment */}
<View className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm">
    <FieldLabel>Card</FieldLabel>
    {isOwner ? (
        <TouchableOpacity
            onPress={() => setShowCardPicker(true)}
            className="flex-row items-center justify-between py-2"
        >
            <Text className="text-base text-text">{editCard || 'Select a card'}</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.text.muted} />
        </TouchableOpacity>
    ) : (
        <Text className="text-base text-text py-2">{task.card}</Text>
    )}
</View>
```

**Step 3: Add the card picker BottomSheet**

Add `BottomSheet` to the imports from `@shared/components/ui`:
```tsx
import { Text, ScreenHeader, FieldLabel, DatePickerSheet, EmptyState, EditableTitle, TextInput, BottomSheet } from '@shared/components/ui';
```

Before the closing `</View>` of the component (after `DatePickerSheet`), add:
```tsx
<BottomSheet
    visible={showCardPicker}
    onClose={() => setShowCardPicker(false)}
>
    <Text className="text-xl font-bold text-text mb-4">Select Card</Text>
    {cardOptions.map((option, index) => (
        <TouchableOpacity
            key={option.key}
            onPress={() => { setEditCard(option.key); setShowCardPicker(false); }}
            className={`flex-row items-center justify-between py-3.5 ${index < cardOptions.length - 1 ? 'border-b border-border-light' : ''}`}
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
</BottomSheet>
```

**Step 4: Verify manually**

Open a task detail. The Card section should show the current card name + a chevron. Tapping it opens a bottom sheet. Selecting a card closes the sheet and updates the row.

**Step 5: Commit**
```bash
git add tandem-mobile/src/features/tasks/screens/TaskDetailScreen.tsx
git commit -m "feat: replace card list with bottom sheet picker in TaskDetailScreen"
```

---

### Task 5: Add due date + notes to "Add Task" sheet (CardDetailScreen)

**Files:**
- Modify: `tandem-mobile/src/features/cards/screens/CardDetailScreen.tsx`

**Step 1: Add new state fields**

In `CardDetailScreen`, find the existing `showAddTask` and `newTaskName` state declarations and add:
```tsx
const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(undefined);
const [newTaskNote, setNewTaskNote] = useState('');
const [showDatePicker, setShowDatePicker] = useState(false);
```

**Step 2: Update handleAddTask to include new fields**

Find `handleAddTask` (line 61). Update the task object and reset logic:
```tsx
const handleAddTask = () => {
    if (!newTaskName.trim()) return;
    const task: Task = {
        id: `t${Date.now()}`,
        name: newTaskName.trim(),
        card: card.name,
        owner: card.owner,
        dueDate: newTaskDueDate ? toDateStringLocal(newTaskDueDate) : '',
        isDone: false,
        note: newTaskNote.trim() || undefined,
    };
    addTask(task);
    setNewTaskName('');
    setNewTaskDueDate(undefined);
    setNewTaskNote('');
    setShowAddTask(false);
};
```

**Step 3: Add toDateStringLocal import**

Ensure this import exists at the top:
```tsx
import { toDateStringLocal } from '@shared/utils/date';
```

**Step 4: Add imports for new UI elements**

Add `FieldLabel` and `DatePickerSheet` to the imports from `@shared/components/ui` if not already present:
```tsx
import { Text, BottomSheet, ScreenHeader, FieldLabel, Badge, EmptyState, TextInput, DatePickerSheet } from '@shared/components/ui';
```

Also add `Ionicons` and `COLORS` if not already imported (they already are in CardDetailScreen).

**Step 5: Expand the Add Task BottomSheet**

Find the Add Task `<BottomSheet>` block (lines 217–238). Replace its contents:
```tsx
<BottomSheet
    visible={showAddTask}
    onClose={() => setShowAddTask(false)}
>
    <Text className="text-xl font-bold text-text mb-4">Add Task to {card.name}</Text>

    <TextInput
        className="text-lg font-medium text-text mb-4 py-3.5 px-4 rounded-xl bg-surface-dim border border-border"
        placeholder="Task name"
        value={newTaskName}
        onChangeText={setNewTaskName}
        autoFocus
        placeholderTextColor={COLORS.text.muted}
    />

    {/* Due Date */}
    <FieldLabel>Due Date</FieldLabel>
    <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        className="py-3 px-4 rounded-xl bg-surface-dim border border-border flex-row items-center gap-3 mb-4"
    >
        <Ionicons name="calendar-outline" size={18} color={COLORS.text.secondary} />
        <Text className="text-base text-text">
            {newTaskDueDate ? newTaskDueDate.toLocaleDateString() : 'No due date'}
        </Text>
    </TouchableOpacity>

    {/* Notes */}
    <FieldLabel>Notes</FieldLabel>
    <TextInput
        className="text-base text-text mb-6 py-3 px-4 rounded-xl bg-surface-dim border border-border min-h-[80px]"
        placeholder="Add notes..."
        value={newTaskNote}
        onChangeText={setNewTaskNote}
        multiline
        textAlignVertical="top"
        placeholderTextColor={COLORS.text.muted}
    />

    <TouchableOpacity
        className="bg-primary-600 py-4 rounded-2xl items-center shadow-sm"
        onPress={handleAddTask}
    >
        <Text className="text-white font-bold text-base">Add Task</Text>
    </TouchableOpacity>
</BottomSheet>
```

**Step 6: Add DatePickerSheet after the BottomSheet**

After the BottomSheet closing tag and before the component's closing `</View>`:
```tsx
<DatePickerSheet
    visible={showDatePicker}
    onClose={() => setShowDatePicker(false)}
    value={newTaskDueDate}
    onChange={setNewTaskDueDate}
/>
```

**Step 7: Verify manually**

Open a card detail and tap the + button. The sheet should show task name, due date row, and notes field. Fill them in, tap Add Task, then open the new task's detail — all fields should be populated.

**Step 8: Commit**
```bash
git add tandem-mobile/src/features/cards/screens/CardDetailScreen.tsx
git commit -m "feat: add due date and notes to add task sheet in CardDetailScreen"
```

---

### Task 6: Auth screen visual polish (SignInScreen)

**Files:**
- Modify: `tandem-mobile/src/features/auth/screens/SignInScreen.tsx`

**Step 1: Add back navigation and clean up the header**

Add `Ionicons` import:
```tsx
import { Ionicons } from '@expo/vector-icons';
```

Replace the entire header `<View className="mb-10">` block (lines 29–38) with a compact left-aligned heading:
```tsx
<View className="mb-8">
    <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="flex-row items-center gap-1 mb-8 -ml-1"
    >
        <Ionicons name="chevron-back" size={28} color="#374151" />
    </TouchableOpacity>
    <Text className="text-[32px] font-bold text-text tracking-tight mb-1">
        Welcome back
    </Text>
    <Text className="text-base text-text-secondary">
        Sign in to continue
    </Text>
</View>
```

**Step 2: Update input styling to rounded-xl**

Find both `TextInput` fields. Change `rounded-lg` to `rounded-xl` on each:
```tsx
className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-text"
```

**Step 3: Update Sign In button to rounded-xl**

Change `rounded-lg` to `rounded-xl` on the sign-in button:
```tsx
className={`bg-primary-600 rounded-xl py-3.5 items-center ${isLoading ? 'opacity-60' : ''}`}
```

**Step 4: Verify manually**

Navigate to Sign In from Welcome. Should show a back chevron, "Welcome back" heading, no redundant Tandem title, and consistent rounded inputs.

**Step 5: Commit**
```bash
git add tandem-mobile/src/features/auth/screens/SignInScreen.tsx
git commit -m "fix: visual polish on SignInScreen - compact header, back nav, rounded-xl inputs"
```

---

### Task 7: Auth screen visual polish (SignUpScreen)

**Files:**
- Modify: `tandem-mobile/src/features/auth/screens/SignUpScreen.tsx`

**Step 1: Add back navigation and fix heading**

Add `Ionicons` import:
```tsx
import { Ionicons } from '@expo/vector-icons';
```

Replace the header `<View className="mb-10">` block (lines 30–37) with:
```tsx
<View className="mb-8">
    <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="flex-row items-center gap-1 mb-8 -ml-1"
    >
        <Ionicons name="chevron-back" size={28} color="#374151" />
    </TouchableOpacity>
    <Text className="text-[32px] font-bold text-text tracking-tight mb-1">
        Create Account
    </Text>
    <Text className="text-base text-text-secondary">
        Join Tandem to start balancing household responsibilities
    </Text>
</View>
```

**Step 2: Update input styling to rounded-xl**

Change all three `TextInput` fields from `rounded-lg` to `rounded-xl`:
```tsx
className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-text"
```

**Step 3: Update Create Account button to rounded-xl**

```tsx
className={`bg-primary-600 rounded-xl py-3.5 items-center mt-2 ${isLoading ? 'opacity-60' : ''}`}
```

**Step 4: Verify manually**

Navigate to Create Account from Welcome. Should show a back chevron, "Create Account" heading, "Join Tandem" subtitle, and consistent rounded inputs matching SignIn.

**Step 5: Commit**
```bash
git add tandem-mobile/src/features/auth/screens/SignUpScreen.tsx
git commit -m "fix: visual polish on SignUpScreen - back nav, fix subtitle, rounded-xl inputs"
```

---

## Execution Order

Tasks are independent but this order minimizes context switching:

1. Task 1 (ScreenHeader padding) — affects both detail screens, do first
2. Task 2 (TaskDetail autoscroll)
3. Task 3 (CardDetail autoscroll)
4. Task 4 (TaskDetail card picker)
5. Task 5 (CardDetail add task fields)
6. Task 6 (SignIn polish)
7. Task 7 (SignUp polish)
