# UI Polish Design — 2026-03-04

## Changes

### 1. Card Selection → Bottom Sheet Picker (TaskDetailScreen)
- Replace embedded scrollable radio list with a tappable row showing current card name + chevron
- Tapping opens a `BottomSheet` with radio rows for each card option
- Matches date picker UX pattern already used on the screen

### 2. Reduce Top Margin on Compact Header (ScreenHeader)
- In compact mode, change `pt-[60px]` to `pt-[44px]`
- Affects: TaskDetailScreen, CardDetailScreen (both use compact ScreenHeader with no title)

### 3. Autoscroll to Notes on Focus (TaskDetailScreen + CardDetailScreen)
- Add `ScrollView` ref to both screens
- Record notes input Y position via `onLayout`
- On notes `TextInput` focus, call `scrollView.current.scrollTo({ y: noteInputY, animated: true })`

### 4. Add Due Date + Notes to "Add Task" Sheet (CardDetailScreen)
- Expand the add-task `BottomSheet` to include: task name → due date picker row → notes multiline input → Add button
- Add `DatePickerSheet` wired up the same way as `TasksScreen`
- Store new state: `newTaskDueDate`, `newTaskNote`, `showDatePicker`
- Pass `note` and `dueDate` when calling `addTask`

### 5. Auth Screen Visual Polish
**SignInScreen:**
- Remove redundant Tandem title + tagline (user came from WelcomeScreen)
- Replace with left-aligned "Welcome back" heading + short subtitle
- Add back chevron to return to WelcomeScreen
- Standardize inputs to `rounded-xl`

**SignUpScreen:**
- Fix subtitle: "Join Fair Play" → "Join Tandem" with matching subtitle
- Align heading style with updated SignIn
- Add back chevron to return to WelcomeScreen
- Standardize inputs to `rounded-xl`
