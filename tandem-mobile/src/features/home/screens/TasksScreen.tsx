import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export const TasksScreen: React.FC = () => {
    const [selectedPerson, setSelectedPerson] = React.useState<'Savannah' | 'Kevin'>('Savannah');

    // Sample data - in a real app, this would come from your state/database
    const allCards = [
        { name: 'Daily Tidying', owner: 'Savannah', tasks: ['Wipe counters', 'Put away items', 'Quick vacuum'] },
        { name: 'Laundry', owner: 'Savannah', tasks: ['Wash clothes', 'Dry clothes', 'Fold and put away'] },
        { name: 'Meal Planning', owner: 'Savannah', tasks: ['Plan weekly menu', 'Make grocery list', 'Check pantry'] },
        { name: 'Grocery Shopping', owner: 'Savannah', tasks: ['Review list', 'Shop for groceries', 'Put away items'] },
        { name: 'Morning Routine', owner: 'Savannah', tasks: ['Wake kids', 'Make breakfast', 'Pack lunches'] },
        { name: 'School Communication', owner: 'Savannah', tasks: ['Check emails', 'Sign forms', 'Update calendar'] },
        { name: 'Dishes & Kitchen Cleanup', owner: 'Kevin', tasks: ['Load dishwasher', 'Wipe counters', 'Take out trash'] },
        { name: 'Deep Cleaning', owner: 'Kevin', tasks: ['Vacuum all rooms', 'Mop floors', 'Clean bathrooms'] },
        { name: 'Trash & Recycling', owner: 'Kevin', tasks: ['Take out trash', 'Sort recycling', 'Clean bins'] },
        { name: 'Yard Work', owner: 'Kevin', tasks: ['Mow lawn', 'Trim hedges', 'Water plants'] },
        { name: 'Car Care', owner: 'Kevin', tasks: ['Wash car', 'Check oil', 'Vacuum interior'] },
        { name: 'Dinner', owner: 'Kevin', tasks: ['Cook dinner', 'Set table', 'Clean up'] },
        { name: 'Bedtime Routine', owner: 'Kevin', tasks: ['Bath time', 'Read stories', 'Tuck in kids'] },
        { name: 'Kid Activities', owner: 'Kevin', tasks: ['Drive to activities', 'Watch practice', 'Pick up kids'] },
    ];

    const userCards = allCards.filter(card => card.owner === selectedPerson);

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>My Tasks</Text>
                <Text style={styles.subtitle}>Tasks organized by card</Text>
            </View>

            {/* Person Selector */}
            <View style={styles.personSelector}>
                <TouchableOpacity
                    style={[
                        styles.personButton,
                        selectedPerson === 'Savannah' && styles.personButtonActive,
                    ]}
                    onPress={() => setSelectedPerson('Savannah')}
                >
                    <Text
                        style={[
                            styles.personButtonText,
                            selectedPerson === 'Savannah' && styles.personButtonTextActive,
                        ]}
                    >
                        Savannah
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.personButton,
                        selectedPerson === 'Kevin' && styles.personButtonActiveKevin,
                    ]}
                    onPress={() => setSelectedPerson('Kevin')}
                >
                    <Text
                        style={[
                            styles.personButtonText,
                            selectedPerson === 'Kevin' && styles.personButtonTextActive,
                        ]}
                    >
                        Kevin
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Summary */}
            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>
                    {userCards.length} {userCards.length === 1 ? 'Card' : 'Cards'}
                </Text>
                <Text style={styles.summarySubtitle}>
                    {userCards.reduce((sum, card) => sum + card.tasks.length, 0)} total tasks
                </Text>
            </View>

            {/* Cards with Tasks */}
            {userCards.map((card, index) => (
                <View key={index} style={styles.cardContainer}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardName}>{card.name}</Text>
                        <View
                            style={[
                                styles.taskCount,
                                selectedPerson === 'Kevin' && styles.taskCountKevin,
                            ]}
                        >
                            <Text style={styles.taskCountText}>{card.tasks.length}</Text>
                        </View>
                    </View>
                    <View style={styles.tasksList}>
                        {card.tasks.map((task, taskIndex) => (
                            <View key={taskIndex} style={styles.taskItem}>
                                <View style={styles.taskCheckbox} />
                                <Text style={styles.taskText}>{task}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            ))}

            {/* Empty State */}
            {userCards.length === 0 && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                        No cards assigned to {selectedPerson}
                    </Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#111827',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 4,
    },
    personSelector: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    personButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e5e7eb',
    },
    personButtonActive: {
        backgroundColor: '#dc2626',
        borderColor: '#dc2626',
    },
    personButtonActiveKevin: {
        backgroundColor: '#c026d3',
        borderColor: '#c026d3',
    },
    personButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
    },
    personButtonTextActive: {
        color: '#ffffff',
    },
    summaryCard: {
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    summaryTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },
    summarySubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    cardContainer: {
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
    },
    taskCount: {
        backgroundColor: '#dc2626',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    taskCountKevin: {
        backgroundColor: '#c026d3',
    },
    taskCountText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
    },
    tasksList: {
        gap: 8,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    taskCheckbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#d1d5db',
        marginRight: 12,
    },
    taskText: {
        fontSize: 15,
        color: '#374151',
        flex: 1,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        color: '#9ca3af',
        textAlign: 'center',
    },
});
