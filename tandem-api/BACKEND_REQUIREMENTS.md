# Backend Requirements Based on Frontend Experience

Based on the frontend mobile app (tandem-mobile), these are the API endpoints and functionality the backend must implement.

## Current Status

✅ **Implemented:**
- Basic authentication (signup, login, email verification)
- User creation and retrieval
- Household creation
- Basic user profile

❌ **Needs Implementation:**
- Most CRUD operations for all entities
- Card template management
- Household card instances
- Invitation system
- User-household relationships
- Card assignment operations

---

## Required API Endpoints

### 1. Authentication (`/api/v1/auth`)
✅ **Implemented:**
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/resend-verification` - Resend verification email

### 2. Users (`/api/v1/users`)

❌ **Needs Implementation:**

```http
# Get current authenticated user
GET /api/v1/users/me
Response: { id, email, name, avatar, authProvider, currentHouseholdId, householdIds, createdAt, updatedAt }

# Get user by ID
GET /api/v1/users/{userId}
Response: User object

# Get user by email
GET /api/v1/users/email/{email}
Response: User object or null

# Update user profile
PUT /api/v1/users/me
Body: { name?, avatar? }
Response: Updated User object

# Get all households for current user
GET /api/v1/users/me/households
Response: Household[]

# Switch current household
PATCH /api/v1/users/me/current-household
Body: { householdId }
Response: Updated User object

# Delete user account
DELETE /api/v1/users/me
Response: 204 No Content
```

**Data Model:**
```typescript
User {
  id: number
  email: string
  name: string
  avatar?: string
  authProvider: 'email' | 'google' | 'apple'
  currentHouseholdId?: number
  householdIds: number[] // All households user belongs to
  createdAt: Date
  updatedAt: Date
}
```

---

### 3. Households (`/api/v1/households`)

✅ **Partial Implementation:**
- `POST /v1/households/create` - Create household

❌ **Needs Implementation:**

```http
# Get household by ID
GET /api/v1/households/{householdId}
Response: { id, name, createdBy, memberIds, activeCardIds, createdAt, updatedAt }

# Get current user's households
GET /api/v1/households
Response: Household[]

# Get household members with details
GET /api/v1/households/{householdId}/members
Response: [
  { userId, name, email, avatar?, joinedAt }
]

# Update household
PUT /api/v1/households/{householdId}
Body: { name?, activeCardIds? }
Response: Updated Household object

# Delete household
DELETE /api/v1/households/{householdId}
Response: 204 No Content

# Add member to household
POST /api/v1/households/{householdId}/members
Body: { userId }
Response: Updated Household object

# Remove member from household
DELETE /api/v1/households/{householdId}/members/{userId}
Response: 204 No Content

# Get household statistics
GET /api/v1/households/{householdId}/stats
Response: { totalCards, totalMembers, balanceStatus }
```

**Data Model:**
```typescript
Household {
  id: number
  name: string
  createdBy: number // userId
  memberIds: number[]
  activeCardIds: number[]
  createdAt: Date
  updatedAt: Date
}

HouseholdMember {
  userId: number
  name: string
  email: string
  avatar?: string
  joinedAt: Date
}
```

**Database Changes Needed:**
```sql
-- Add created_by column to households table
ALTER TABLE households ADD COLUMN created_by INTEGER REFERENCES users(id);

-- Create household_members junction table
CREATE TABLE household_members (
    household_id INTEGER REFERENCES households(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (household_id, user_id)
);

-- Create user_households junction table for multi-household support
CREATE TABLE user_households (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    household_id INTEGER REFERENCES households(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (user_id, household_id)
);
```

---

### 4. Card Templates (`/api/v1/card-templates`)

❌ **Needs Full Implementation:**

```http
# Get all card templates
GET /api/v1/card-templates
Response: CardTemplate[]

# Get card template by ID
GET /api/v1/card-templates/{cardId}
Response: CardTemplate

# Get cards by category
GET /api/v1/card-templates?category={category}
Response: CardTemplate[]

# Get multiple cards by IDs
POST /api/v1/card-templates/by-ids
Body: { cardIds: number[] }
Response: CardTemplate[]
```

**Data Model:**
```typescript
CardTemplate {
  id: number
  name: string
  category: 'home_care' | 'food_meals' | 'childcare' | 'financial' | 'social_family' | 'personal_care'
  description: string
  conceptionDescription: string
  planningDescription: string
  executionDescription: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'as_needed'
  iconName: string
}
```

**Database Changes Needed:**
```sql
-- Drop existing cards table
DROP TABLE IF EXISTS cards;

-- Create card_templates table
CREATE TABLE card_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    conception_description TEXT,
    planning_description TEXT,
    execution_description TEXT,
    frequency VARCHAR(20) NOT NULL,
    icon_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial card templates
INSERT INTO card_templates (name, category, description, conception_description, planning_description, execution_description, frequency, icon_name) VALUES
('Grocery Shopping', 'food_meals', 'Plan and purchase household food and supplies', 'Decide what meals to eat', 'Write shopping list', 'Go to store and buy items', 'weekly', 'shopping-cart'),
('Meal Planning', 'food_meals', 'Decide what meals to prepare for the week', 'Think about family preferences', 'Plan weekly menu', 'Create meal schedule', 'weekly', 'calendar'),
('Cooking', 'food_meals', 'Prepare meals for the household', 'Choose recipes', 'Gather ingredients', 'Cook the meal', 'daily', 'utensils'),
('Cleaning', 'home_care', 'Maintain a tidy and organized home', 'Decide what needs cleaning', 'Plan cleaning schedule', 'Clean surfaces and spaces', 'weekly', 'broom'),
('Laundry', 'home_care', 'Wash, dry, and fold clothing', 'Sort clothing by type', 'Select appropriate cycle', 'Run washer and dryer', 'weekly', 'tshirt'),
('Dishes', 'home_care', 'Wash and put away dishes', 'Identify dirty dishes', 'Organize by priority', 'Clean and store', 'daily', 'soap'),
-- ... more templates
;
```

---

### 5. Household Cards (`/api/v1/households/{householdId}/cards`)

❌ **Needs Full Implementation:**

```http
# Get all cards for a household
GET /api/v1/households/{householdId}/cards
Response: HouseholdCard[]

# Get card instance by ID
GET /api/v1/households/{householdId}/cards/{cardId}
Response: HouseholdCard

# Get cards assigned to specific user
GET /api/v1/households/{householdId}/cards?assignedTo={userId}
Response: HouseholdCard[]

# Add card template to household (create instance)
POST /api/v1/households/{householdId}/cards
Body: { cardId (template id), currentOwner? }
Response: HouseholdCard

# Update card assignment
PUT /api/v1/households/{householdId}/cards/{cardId}
Body: { currentOwner, isActive?, notes? }
Response: HouseholdCard

# Assign card to user
POST /api/v1/households/{householdId}/cards/{cardId}/assign
Body: { assignedTo, assignedBy, note? }
Response: HouseholdCard

# Delete card from household
DELETE /api/v1/households/{householdId}/cards/{cardId}
Response: 204 No Content

# Check if card template already exists in household
GET /api/v1/households/{householdId}/cards/exists/{templateId}
Response: { exists: boolean }
```

**Data Model:**
```typescript
HouseholdCard {
  id: number
  householdId: number
  cardId: number // references card_templates
  currentOwner: number | null // userId or null if unassigned
  isActive: boolean
  assignmentHistory: Assignment[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

Assignment {
  assignedTo: number | null
  assignedBy: number
  assignedAt: Date
  note?: string
}
```

**Database Changes Needed:**
```sql
-- Create household_cards table
CREATE TABLE household_cards (
    id SERIAL PRIMARY KEY,
    household_id INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    card_id INTEGER NOT NULL REFERENCES card_templates(id),
    current_owner INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(household_id, card_id)
);

-- Create assignment_history table
CREATE TABLE assignment_history (
    id SERIAL PRIMARY KEY,
    household_card_id INTEGER NOT NULL REFERENCES household_cards(id) ON DELETE CASCADE,
    assigned_to INTEGER REFERENCES users(id),
    assigned_by INTEGER NOT NULL REFERENCES users(id),
    note TEXT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 6. Invitations (`/api/v1/invitations`)

❌ **Needs Full Implementation:**

```http
# Get all invitations for a household
GET /api/v1/households/{householdId}/invitations
Response: Invitation[]

# Create invitation
POST /api/v1/households/{householdId}/invitations
Body: { invitedEmail }
Response: Invitation

# Get invitation by invite code
GET /api/v1/invitations/{inviteCode}
Response: Invitation

# Accept invitation
POST /api/v1/invitations/{inviteCode}/accept
Response: Invitation (status = 'accepted')

# Delete/cancel invitation
DELETE /api/v1/invitations/{invitationId}
Response: 204 No Content

# Check if invitation is expired
GET /api/v1/invitations/{invitationId}/expired
Response: { expired: boolean }
```

**Data Model:**
```typescript
Invitation {
  id: number
  householdId: number
  invitedBy: number // userId
  invitedEmail: string
  inviteCode: string // unique code for joining
  status: 'pending' | 'accepted' | 'expired' | 'declined'
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}
```

**Database Changes Needed:**
```sql
-- Create invitations table
CREATE TABLE invitations (
    id SERIAL PRIMARY KEY,
    household_id INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    invited_by INTEGER NOT NULL REFERENCES users(id),
    invited_email VARCHAR(255) NOT NULL,
    invite_code VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invitations_invite_code ON invitations(invite_code);
CREATE INDEX idx_invitations_household_id ON invitations(household_id);
```

---

### 7. Dashboard & Statistics (`/api/v1/households/{householdId}/dashboard`)

❌ **Needs Implementation:**

```http
# Get dashboard data (workload balance, card counts, etc.)
GET /api/v1/households/{householdId}/dashboard
Response: {
  household: Household
  members: HouseholdMember[]
  balance: {
    totalCards: number
    userCounts: { [userId]: number }
    balanceStatus: 'fair' | 'needs-review'
  }
  myCards: HouseholdCard[]
  partnerCards?: HouseholdCard[]
  householdStats: {
    totalCards: number
    totalMembers: number
    balanceStatus: 'fair' | 'needs-review'
  }
}
```

---

## Additional Requirements

### 1. Authorization & Permissions

All endpoints must check:
- User is authenticated (JWT token)
- User has permission to access the resource
  - Users can only access households they are members of
  - Users can only modify household cards in their household
  - Invitations can only be created by household members
  - Users can only modify their own profile (unless admin)

### 2. Business Logic

**Card Assignment:**
- When assigning a card, append to `assignmentHistory`
- Update `currentOwner` on HouseholdCard
- Track who assigned it and when

**Household Membership:**
- When a user joins a household, add to `user_households` junction table
- Update user's `householdIds` array
- Set as `currentHouseholdId` if it's their first household

**Invitations:**
- Generate unique `inviteCode` on creation
- Set expiration date (e.g., 7 days from creation)
- When accepted:
  - Mark invitation as 'accepted'
  - Add user to household
  - Update user's household membership

**Workload Balance:**
- Calculate workload balance by counting cards per user
- Consider only `isActive` cards
- Display percentage split
- Flag "needs review" if split is >10% off 50/50

### 3. Pagination

For list endpoints, implement pagination:
```http
GET /api/v1/households/{householdId}/cards?page=1&limit=20
Response: { data: HouseholdCard[], page: number, limit: number, total: number }
```

### 4. Error Handling

Standardize error responses:
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Field 'name' is required",
  "field": "name",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

Common error codes:
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409) - e.g., card already exists in household
- `INTERNAL_ERROR` (500)

### 5. Data Validation

Implement validation for:
- Email format
- Required fields
- String length limits
- Enum values (category, frequency, status)
- UUID/ID format validation

---

## Summary

**Critical Endpoints to Implement:**

1. ✅ Authentication (done)
2. ❌ User profile management (GET/UPDATE current user)
3. ❌ Household CRUD operations (GET, UPDATE, DELETE)
4. ❌ Household member management
5. ❌ Card templates (GET all, by ID, by category)
6. ❌ Household card instances (CRUD operations)
7. ❌ Card assignment operations
8. ❌ Invitation system (CRUD operations)
9. ❌ Dashboard/statistics endpoints
10. ❌ Multi-household support

**Database Migrations Needed:**

1. Card templates table (replace existing cards table)
2. Household members junction table
3. User households junction table
4. Household cards table
5. Assignment history table
6. Invitations table
7. Add `created_by` to households table

**Estimated Development Time:**

- Database migrations: 2-3 hours
- Card templates API: 4-6 hours
- Household card API: 8-10 hours
- Invitation system: 6-8 hours
- Dashboard/statistics: 4-6 hours
- Testing & refinement: 8-10 hours

**Total: ~32-42 hours**
