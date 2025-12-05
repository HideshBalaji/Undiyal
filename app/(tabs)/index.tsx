// app/index.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  initDatabase,
  getExpenses,
  addExpense,
  deleteExpense,
  getMonthlyTotal,
  Expense,
} from "../database";

export default function HomeScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [monthlyTotal, setMonthlyTotal] = useState(0); // number, not string

  // ---- load expenses + monthly total ----
  const loadExpenses = async () => {
    try {
      const data = await getExpenses();
      setExpenses(data);

      const mTotal = await getMonthlyTotal();
      setMonthlyTotal(mTotal);
    } catch (error) {
      Alert.alert("Error", "Failed to load expenses");
    }
  };

  useEffect(() => {
    const setup = async () => {
      await initDatabase();
      await loadExpenses();
    };
    setup();
  }, []);

  const handleAddExpense = async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert("Missing data", "Please enter both title and amount");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid positive number");
      return;
    }

    try {
      await addExpense(title.trim(), numericAmount, category.trim());
      setTitle("");
      setAmount("");
      setCategory("");
      await loadExpenses();
    } catch (error) {
      Alert.alert("Error", "Failed to add expense");
    }
  };

  const handleDeleteExpense = (id: number, title: string) => {
    Alert.alert("Delete expense", `Delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteExpense(id);
            await loadExpenses();
          } catch (error) {
            Alert.alert("Error", "Failed to delete expense");
          }
        },
      },
    ]);
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const renderItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity
      onLongPress={() => handleDeleteExpense(item.id, item.title)}
      style={styles.expenseItem}
    >
      <View>
        <Text style={styles.expenseTitle}>{item.title}</Text>
        {item.category ? (
          <Text style={styles.expenseCategory}>{item.category}</Text>
        ) : null}
        <Text style={styles.expenseDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.expenseAmount}>₹ {item.amount.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="light" />
      <View style={styles.inner}>
        <Text style={styles.header}>Undiyal</Text>

        {/* Summary cards */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <View style={[styles.summaryCard, { flex: 1 }]}>
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={styles.summaryAmount}>₹ {total.toFixed(2)}</Text>
          </View>

          <View style={[styles.summaryCard, { flex: 1 }]}>
            <Text style={styles.summaryLabel}>This Month</Text>
            <Text style={[styles.summaryAmount, { color: "#3b82f6" }]}>
              ₹ {monthlyTotal.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            placeholder="Title (e.g. Food)"
            placeholderTextColor="#94a3b8"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Amount"
            placeholderTextColor="#94a3b8"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Category (optional)"
            placeholderTextColor="#94a3b8"
            value={category}
            onChangeText={setCategory}
          />

          <TouchableOpacity style={styles.addButton} onPress={handleAddExpense}>
            <Text style={styles.addButtonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.listHeader}>Recent expenses</Text>

        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={expenses.length === 0 && styles.emptyList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No expenses yet. Add your first one!
            </Text>
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  inner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "#e5e7eb",
    textAlign: "center",
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#9ca3af",
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#22c55e",
    marginTop: 4,
  },
  inputCard: {
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  input: {
    backgroundColor: "#020617",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#e5e7eb",
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 8,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: "#22c55e",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  addButtonText: {
    fontWeight: "700",
    color: "#022c22",
    fontSize: 16,
  },
  listHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 8,
  },
  expenseItem: {
    backgroundColor: "#020617",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f9fafb",
  },
  expenseCategory: {
    fontSize: 12,
    color: "#a5b4fc",
    marginTop: 2,
  },
  expenseDate: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f97316",
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 16,
  },
});
