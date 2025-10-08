# Fair Play App - Quick Start Guide

## 🚀 Get Started in 5 Steps

### Step 1: Set Up Firebase (10 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it "Fair Play" and follow the setup wizard
4. Enable **Authentication**:
   - Click "Authentication" in the left sidebar
   - Click "Get Started"
   - Enable "Email/Password" provider
5. Create **Firestore Database**:
   - Click "Firestore Database" in the left sidebar
   - Click "Create database"
   - Start in **test mode** (we'll add security rules later)
   - Choose a region close to you
6. Get your **Firebase config**:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps"
   - Click "Web app" icon
   - Register app with name "Fair Play Web"
   - Copy the `firebaseConfig` object

### Step 2: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and paste your Firebase configuration:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=fair-play-xxxxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=fair-play-xxxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=fair-play-xxxxx.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 3: Install Dependencies

Dependencies are already installed! If you need to reinstall:

```bash
npm install --legacy-peer-deps
```

### Step 4: Seed Card Templates to Firebase

Create a seed script `scripts/seedCards.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { CARD_TEMPLATES } from '../src/shared/constants/cardTemplates';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedCards() {
  console.log('Seeding card templates...');
  
  for (const card of CARD_TEMPLATES) {
    const cardRef = doc(collection(db, 'card_templates'));
    await setDoc(cardRef, {
      ...card,
      id: cardRef.id,
    });
    console.log(`Added: ${card.name}`);
  }
  
  console.log('✅ All 36 cards seeded successfully!');
}

seedCards().catch(console.error);
```

Run the seed script:

```bash
npx ts-node scripts/seedCards.ts
```

### Step 5: Start the App

```bash
# Start Metro bundler
npm run start

# Then press:
# i - for iOS simulator
# a - for Android emulator
# w - for web browser
```

## 📱 Testing the App

### Create Your First Account
1. App opens to Welcome screen
2. Tap "Create Account"
3. Enter your name, email, and password
4. Tap "Create Account"

### Create Your First Household
1. After sign up, you'll be prompted to create a household
2. Enter a household name (e.g., "The Smith Family")
3. Tap "Create Household"

### Browse and Add Cards
1. Go to "Cards" tab
2. Browse the 36 Fair Play cards
3. Tap a card to see details
4. Tap "Add to Household"
5. Assign to yourself or your partner

### View Dashboard
1. Go to "Home" tab
2. See your assigned cards
3. View workload balance meter
4. Track recent changes

## 🔧 Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache
npx expo start -c
```

### TypeScript Errors
```bash
# Restart TypeScript server
# In VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Firebase Connection Issues
- Double-check your `.env` file has correct values
- Ensure you've enabled Authentication and created Firestore database
- Check Firebase Console for any security rule errors

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules
npm install --legacy-peer-deps
```

## 🎨 Customize the App

### Change Brand Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#YOUR_COLOR',
    600: '#YOUR_DARKER_COLOR',
  },
}
```

### Add Your Own Cards

Edit `src/shared/constants/cardTemplates.ts` and add new cards:

```typescript
{
  name: 'Your Custom Card',
  category: CardCategory.HOME_CARE,
  description: 'What this responsibility means',
  conceptionDescription: 'Deciding what needs to be done',
  planningDescription: 'Planning how to do it',
  executionDescription: 'Actually doing the task',
  frequency: TaskFrequency.WEEKLY,
  iconName: 'custom-icon',
}
```

## 📚 Next Steps

### Must-Do Before Launch
- [ ] Implement authentication service hooks
- [ ] Complete card assignment logic
- [ ] Build household invitation system
- [ ] Add Firestore security rules
- [ ] Test on real devices
- [ ] Add app icons and splash screen

### Nice-to-Have Features
- [ ] Push notifications
- [ ] Offline support
- [ ] Dark mode
- [ ] Custom card creation
- [ ] Task completion tracking
- [ ] Analytics dashboard

## 🔒 Security Rules

Add these to Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is household member
    function isHouseholdMember(householdId) {
      return isAuthenticated() && 
             request.auth.uid in get(/databases/$(database)/documents/households/$(householdId)).data.memberIds;
    }
    
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Household members can read/write household data
    match /households/{householdId} {
      allow read: if isAuthenticated() && request.auth.uid in resource.data.memberIds;
      allow create: if isAuthenticated();
      allow update, delete: if isHouseholdMember(householdId);
    }
    
    // Anyone authenticated can read card templates
    match /card_templates/{cardId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only admins can modify templates
    }
    
    // Household members can manage their household cards
    match /household_cards/{cardId} {
      allow read, write: if isHouseholdMember(resource.data.householdId);
    }
    
    // Invitations
    match /invitations/{invitationId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
                              (request.auth.uid == resource.data.invitedBy || 
                               request.auth.email == resource.data.invitedEmail);
    }
  }
}
```

## 💡 Pro Tips

1. **Use React Query** for all Firebase data fetching (already set up with TanStack Query)
2. **Implement optimistic updates** for better UX
3. **Add error boundaries** to catch React errors gracefully
4. **Use TypeScript strictly** - the types will save you from bugs
5. **Keep components small** - follow Single Responsibility Principle
6. **Test early, test often** - especially the authentication flow

## 🎯 Development Workflow

```bash
# 1. Create a new feature branch
git checkout -b feature/new-feature

# 2. Make your changes

# 3. Format and lint
npm run format
npm run lint

# 4. Test on simulators
npm run ios
npm run android

# 5. Commit with descriptive messages
git commit -m "feat: add card assignment logic"

# 6. Push and create PR
git push origin feature/new-feature
```

## 📖 Learn More

- **Architecture**: Read `ARCHITECTURE.md` for deep dive
- **Implementation**: Read `IMPLEMENTATION_SUMMARY.md` for what's built
- **Fair Play Methodology**: Visit [fairplaylife.com](https://www.fairplaylife.com/)
- **React Native**: [reactnative.dev/docs](https://reactnative.dev/docs/getting-started)
- **Firebase**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **NativeWind**: [nativewind.dev](https://nativewind.dev/)

## 🆘 Need Help?

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| App won't start | Clear cache: `npx expo start -c` |
| TypeScript errors | Restart TS server in IDE |
| Firebase errors | Check `.env` configuration |
| Module errors | Reinstall: `npm install --legacy-peer-deps` |
| Styling issues | Clear Metro cache |

---

**You're all set!** 🎉 Start building and make household labor visible and equitable!

