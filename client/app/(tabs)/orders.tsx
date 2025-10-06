import React, { useContext, useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ToastAndroid, Modal, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Octicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import { useAuthContext } from "@/context/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { useRouter, useFocusEffect } from "expo-router";

const OrderStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

const OrdersScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const { user, logout } = useAuthContext();
  const { orders, loading, error, fetchOrders, updateOrderStatus } = useOrders();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [logoutModal, setLogoutModal] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      Alert.alert("Login Required", "Please login to view your orders", [
        { text: "OK", onPress: () => logout() },
      ]);
    } else {
      fetchOrders();
    }
  }, [user]);

  // 🔹 Fetch orders every time screen refocuses
  useFocusEffect(
    useCallback(() => {
      if (!user) {
        router.push("/login");
      } else {
        fetchOrders();
      }
    }, [user])
  );

  const handleShowDetails = (order: any) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (error) {
    ToastAndroid.show(error, ToastAndroid.SHORT);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>My Orders</Text>
        <TouchableOpacity onPress={() => setLogoutModal(true)}>
          <Octicons name="sign-out" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {orders.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: theme.subtle }}>No orders found</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleShowDetails(item)}
              style={[
                styles.card,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.product, { color: theme.text }]}>
                  Order #{item.id}
                </Text>
                <Octicons name="chevron-right" size={18} color={theme.subtle} />
              </View>

              <Text style={[styles.detail, { color: theme.text }]}>
                Status: {item.status}
              </Text>
              <Text style={[styles.detail, { color: theme.accent }]}>
                Total: ₦{item.totalAmount.toLocaleString()}
              </Text>
              <Text style={[styles.date, { color: theme.subtle }]}>
                {new Date(item.createdAt).toDateString()}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Order Detail Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Order #{selectedOrder?.id} Details
            </Text>
            {selectedOrder?.orderItems?.map((item: any) => (
              <View key={item.id} style={styles.modalItem}>
                <Text style={[styles.detail, { color: theme.text }]}>
                  {item.product.name} x{item.quantity}
                </Text>
                <Text style={[styles.detail, { color: theme.accent }]}>
                  ₦{item.subtotal.toLocaleString()}
                </Text>
              </View>
            ))}
            {user?.role === "ADMIN" && (
              <TouchableOpacity
                style={[styles.updateBtn, { backgroundColor: theme.accent }]}
                onPress={() => {
                  setStatusModalVisible(true);
                }}
              >
                <Text style={styles.closeText}>Update Status</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.accent }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 🔹 Admin Status Update Modal */}
      <Modal visible={statusModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Update Order Status
            </Text>

            {Object.values(OrderStatus).map((status) => (
              <TouchableOpacity
                key={status}
                onPress={async () => {
                  try {
                    await updateOrderStatus(selectedOrder.id, status);
                    ToastAndroid.show(
                      `Status updated to ${status}`,
                      ToastAndroid.SHORT
                    );
                    setSelectedStatus(status);
                    setStatusModalVisible(false);
                    setModalVisible(false);
                  } catch (err: any) {
                    Alert.alert("Update Failed", err.message);
                  }
                }}
                style={[
                  styles.statusOption,
                  {
                    backgroundColor:
                      selectedStatus === status ? theme.accent : "transparent",
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color:
                      selectedStatus === status ? "#fff" : theme.text,
                    fontWeight: "500",
                  }}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: "#888" }]}
              onPress={() => setStatusModalVisible(false)}
            >
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 🔹 Logout confirmation modal */}
      <Modal visible={logoutModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Confirm Logout
            </Text>
            <Text style={{ color: theme.text + "90", marginBottom: 16 }}>
              Are you sure you want to log out?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setLogoutModal(false)}>
                <Text style={{ color: theme.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setLogoutModal(false);
                  logout();
                }}
              >
                <Text style={{ color: "#D9534F", fontWeight: "600" }}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "600" },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  product: { fontSize: 18, fontWeight: "500" },
  detail: { fontSize: 15, marginTop: 4 },
  date: { fontSize: 13, marginTop: 6 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    width: "85%",
    padding: 20,
    borderRadius: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  updateBtn: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  statusOption: {
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 8,
  },

  closeBtn: {
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  closeText: { color: "#fff", fontWeight: "600" },
});
