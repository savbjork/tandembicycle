import React, { useEffect } from 'react';
import { useAuthStore, useDataStore } from '@store';
import { supabase } from '@lib/supabase';
import type { Card, Task, DropZoneItem } from '@shared/data/FakeDataStore';

/**
 * Loads cards and tasks from Supabase into the data store when the user is authenticated.
 * Re-runs whenever the authenticated user changes.
 */
export const DataInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuthStore();
    const { setCards, setTasks, setDropZoneItems, setHouseholdContext } = useDataStore();

    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        const loadData = async () => {
            // 1. Find the user's household
            const { data: membership } = await supabase
                .from('household_members')
                .select('household_id')
                .eq('user_id', user.id)
                .single();

            if (!membership) return;
            const householdId = membership.household_id;

            // 2. Build display name ↔ UUID maps for all household members
            const { data: members } = await supabase
                .from('household_members')
                .select('user_id, profiles(display_name)')
                .eq('household_id', householdId);

            const userIdByName: Record<string, string> = {};
            const nameByUserId: Record<string, string> = {};
            for (const m of members ?? []) {
                const name = (m.profiles as unknown as { display_name: string } | null)?.display_name ?? 'Unknown';
                userIdByName[name] = m.user_id;
                nameByUserId[m.user_id] = name;
            }

            setHouseholdContext(householdId, userIdByName, nameByUserId);

            // 3. Fetch active cards
            const { data: activeCardsData } = await supabase
                .from('cards')
                .select('id, name, note, owner_id')
                .eq('household_id', householdId)
                .eq('is_archived', false)
                .order('created_at');

            const activeCards: Card[] = (activeCardsData ?? []).map((c) => ({
                dbId: c.id as string,
                name: c.name as string,
                owner: nameByUserId[c.owner_id as string] ?? 'Unknown',
                note: (c.note as string | null) ?? undefined,
            }));

            // 3b. Fetch archived cards
            const { data: archivedCardsData } = await supabase
                .from('cards')
                .select('id, name, note, owner_id, archived_at')
                .eq('household_id', householdId)
                .eq('is_archived', true)
                .order('created_at');

            const archivedCards: Card[] = (archivedCardsData ?? []).map((c) => ({
                dbId: c.id as string,
                name: c.name as string,
                owner: nameByUserId[c.owner_id as string] ?? 'Unknown',
                note: (c.note as string | null) ?? undefined,
                archived: true,
                archivedAt: (c.archived_at as string | null) ?? undefined,
            }));

            setCards([...activeCards, ...archivedCards]);

            // 4. Build card DB id → name map for task mapping
            const allCardsData = [...(activeCardsData ?? []), ...(archivedCardsData ?? [])];
            const cardNameById: Record<string, string> = {};
            for (const c of allCardsData) {
                cardNameById[c.id as string] = c.name as string;
            }

            // 5. Fetch tasks
            const { data: tasksData } = await supabase
                .from('tasks')
                .select('id, name, note, due_date, is_done, card_id, owner_id')
                .eq('household_id', householdId)
                .order('created_at', { ascending: false });

            const tasks: Task[] = (tasksData ?? []).map((t) => ({
                id: t.id as string,
                name: t.name as string,
                card: cardNameById[t.card_id as string] ?? '',
                owner: nameByUserId[t.owner_id as string] ?? 'Unknown',
                dueDate: (t.due_date as string | null) ?? '',
                isDone: t.is_done as boolean,
                note: (t.note as string | null) ?? undefined,
            }));

            setTasks(tasks);

            // 6. Fetch messages (inbox)
            const { data: messagesData } = await supabase
                .from('messages')
                .select('id, sender_id, receiver_id, content, status, created_at')
                .eq('household_id', householdId)
                .order('created_at', { ascending: false });

            const dropZoneItems: DropZoneItem[] = (messagesData ?? []).map((m) => ({
                id: m.id as string,
                sender: nameByUserId[m.sender_id as string] ?? 'Unknown',
                receiver: nameByUserId[m.receiver_id as string] ?? 'Unknown',
                content: m.content as string,
                status: m.status as DropZoneItem['status'],
                createdAt: new Date(m.created_at as string),
            }));

            setDropZoneItems(dropZoneItems);
        };

        loadData();
    }, [isAuthenticated, user?.id, setCards, setTasks, setDropZoneItems, setHouseholdContext]);

    return <>{children}</>;
};
