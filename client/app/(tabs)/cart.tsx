import React, { useContext, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  ToastAndroid,
  Platform,
  StyleSheet,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import Animated, { LinearTransition } from "react-native-reanimated";
import { Octicons } from "@expo/vector-icons";
import { ThemeContext } from "@/context/ThemeContext";
import { useAuthContext } from "@/context/AuthContext";
import { useCart } from "@/hooks/useCart";
import { useOrders } from "@/hooks/useOrders";

export default function CartScreen() {
  const { theme } = useContext(ThemeContext);
  const router = useRouter();
  const { user, token, logout } = useAuthContext();
  const { cart, loading, addToCart, updateCart, removeFromCart, fetchCart } = useCart(token);
  const { createOrder, loading: orderLoading } = useOrders();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [logoutModal, setLogoutModal] = useState(false);

  // 🔹 Fetch cart every time screen refocuses
  useFocusEffect(
    useCallback(() => {
      if (!user) {
        router.push("/login");
      } else {
        fetchCart();
      }
    }, [user])
  );

  const handleRemovePress = (cartItemId: number) => {
    setSelectedItemId(cartItemId);
    setDeleteModalVisible(true);
  };

  const confirmRemove = async () => {
    if (selectedItemId) {
      await removeFromCart(selectedItemId);
      setDeleteModalVisible(false);
      setSelectedItemId(null);
    }
  };

  const handleCheckout = async () => {
    try {
      if (!cart || !cart.id) return;
      await createOrder(cart.id);

      const msg = "Order placed successfully!";
      Platform.OS === "android"
        ? ToastAndroid.show(msg, ToastAndroid.SHORT)
        : alert(msg);

      router.push("/orders");
    } catch (err: any) {
      const message = err.message || "Checkout failed";
      Platform.OS === "android"
        ? ToastAndroid.show(message, ToastAndroid.SHORT)
        : alert(message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Loading cart...</Text>
      </SafeAreaView>
    );
  }

  if (!cart || cart.cartItems.length === 0) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
        <Octicons name="alert" size={30} color={theme.text} />
        <Text style={{ color: theme.text, marginVertical: 12, fontSize: 16 }}>
          Your cart is empty
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)")}
          style={[styles.shopNowBtn, { backgroundColor: theme.accent }]}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Shop Now</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>My Cart</Text>
        {user && (
          <TouchableOpacity onPress={() => setLogoutModal(true)}>
            <Octicons name="sign-out" size={22} color={theme.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Cart Items */}
      <Animated.FlatList
        data={cart.cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={styles.cardContent}>
              <Image
                source={{
                  uri: item.product.imageUrl || "https://via.placeholder.com/80",
                }}
                style={styles.image}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: theme.text }]}>{item.product.name}</Text>
                <Text style={{ color: theme.text + "80", marginBottom: 6 }}>
                  ₦{item.product.price.toLocaleString()}
                </Text>
                <Text style={{ color: theme.text, fontWeight: "600" }}>
                  Subtotal: ₦{item.subtotal.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Quantity Controls */}
            <View style={styles.controls}>
              <TouchableOpacity
                onPress={() => updateCart(item.id, 1)}
                style={[styles.controlBtn, { backgroundColor: theme.accent }]}
              >
                <Octicons name="dash" size={16} color="#fff" />
              </TouchableOpacity>

              <Text style={[styles.qtyText, { color: theme.text }]}>{item.quantity}</Text>

              <TouchableOpacity
                onPress={() => addToCart(item.product.id, 1)}
                style={[styles.controlBtn, { backgroundColor: theme.accent }]}
              >
                <Octicons name="plus" size={16} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleRemovePress(item.id)}
                style={[styles.controlBtn, { backgroundColor: "#D9534F" }]}
              >
                <Octicons name="trash" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        itemLayoutAnimation={LinearTransition}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={[styles.totalText, { color: theme.text }]}>
              Total: ₦{cart.total.toLocaleString()}
            </Text>

            <TouchableOpacity
              onPress={handleCheckout}
              disabled={orderLoading}
              style={[
                styles.checkoutBtn,
                {
                  backgroundColor: orderLoading ? theme.border : theme.accent,
                },
              ]}
            >
              {orderLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.checkoutText}>Checkout</Text>
              )}
            </TouchableOpacity>
          </View>
        }
      />

      {/* 🔹 Delete Confirmation Modal */}
      <Modal
        transparent
        visible={deleteModalVisible}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Remove Item</Text>
            <Text style={{ color: theme.text, marginBottom: 16 }}>
              Are you sure you want to remove this item from your cart?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(false)}
                style={[styles.modalBtn, { backgroundColor: theme.border }]}
              >
                <Text style={{ color: theme.text }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmRemove}
                style={[styles.modalBtn, { backgroundColor: "#D9534F" }]}
              >
                <Text style={{ color: "#fff" }}>Remove</Text>
              </TouchableOpacity>
            </View>
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
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  shopNowBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  card: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 },
  cardContent: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
  name: { fontSize: 16, fontWeight: "500" },
  controls: { flexDirection: "row", alignItems: "center", gap: 10, justifyContent: "flex-end" },
  controlBtn: { padding: 6, borderRadius: 6 },
  qtyText: { fontSize: 16, fontWeight: "600" },
  footer: { marginTop: 20, paddingTop: 10, borderTopWidth: 1, alignItems: "center" },
  totalText: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  checkoutBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, alignItems: "center", justifyContent: "center", width: "100%" },
  checkoutText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  // 🔹 Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    width: "80%",
    borderRadius: 10,
    padding: 20,
    elevation: 10,
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
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  modalBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
});
