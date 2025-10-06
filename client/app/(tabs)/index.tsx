// app/(tabs)/products.tsx
import React, { useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ToastAndroid,
  Platform,
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import Animated, { LinearTransition, FadeInUp } from "react-native-reanimated";
import { Octicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { ThemeContext } from "../../context/ThemeContext";
import { useProduct } from "../../hooks/useProduct";
import { useAuthContext } from "../../context/AuthContext";
import { useCart } from "../../hooks/useCart";

type ProductForm = {
  name: string;
  description: string;
  price: string; // store as string for input, parseNumber before send
  stockQuantity: string;
  imageUrl?: string;
};

export default function ProductsScreen() {
  const { theme } = useContext(ThemeContext);
  const router = useRouter();
  const { products, loading, fetchProducts, pagination, createProduct, updateProduct, deleteProduct } =
    useProduct();
  const { user, token, logout } = useAuthContext();
  const { addToCart } = useCart(token);
  const [logoutModal, setLogoutModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [priceModal, setPriceModal] = useState(false);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [page, setPage] = useState(1);

  // product detail / admin form modal
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false); // for create/edit form
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    imageUrl: "",
  });
  const [selectedProduct, setSelectedProduct] = useState<any>(null); // used for detail view

  const handleAddToCart = async (id: number) => {
    if (!user) return router.push("/login");
    try {
      await addToCart(id, 1);
      if (Platform.OS === "android") {
        ToastAndroid.show("Added to cart!", ToastAndroid.SHORT);
      } else {
        Alert.alert("Success", "Added to cart!");
      }
    } catch (error) {
      if (Platform.OS === "android") {
        ToastAndroid.show("Failed to add to cart!", ToastAndroid.SHORT);
      } else {
        Alert.alert("Error", "Failed to add to cart!");
      }
    }
  };

  const handleSearch = () => {
    fetchProducts({ search, minPrice, maxPrice, page: 1, limit: pagination.limit });
    setPage(1);
  };

  const handleEndReached = () => {
    if (page < pagination.totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts({ search, minPrice, maxPrice, page: nextPage, limit: pagination.limit });
    }
  };

  const openDetails = (product: any) => {
    setSelectedProduct(product);
    setDetailModalVisible(true);
  };

  // Admin: open create modal
  const openCreateModal = () => {
    setIsEditing(false);
    setEditingProductId(null);
    setForm({ name: "", description: "", price: "", stockQuantity: "", imageUrl: "" });
    setFormModalVisible(true);
  };

  // Admin: open edit modal and populate fields
  const openEditModal = (product: any) => {
    setIsEditing(true);
    setEditingProductId(product.id);
    setForm({
      name: product.name ?? "",
      description: product.description ?? "",
      price: product.price?.toString() ?? "",
      stockQuantity: product.stockQuantity?.toString() ?? "0",
      imageUrl: product.imageUrl ?? "",
    });
    setFormModalVisible(true);
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      Alert.alert("Validation", "Product name is required");
      return false;
    }
    const priceNum = Number(form.price);
    if (!form.price || Number.isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Validation", "Price must be a positive number");
      return false;
    }
    const stockNum = Number(form.stockQuantity);
    if (form.stockQuantity === "" || Number.isNaN(stockNum) || stockNum < 0) {
      Alert.alert("Validation", "Stock quantity must be 0 or greater");
      return false;
    }
    return true;
  };

  const handleSubmitForm = async () => {
    if (!token) return Alert.alert("Unauthorized", "You must be logged in as admin");
    if (!validateForm()) return;

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        imageUrl: form.imageUrl?.trim() || undefined,
      };

      if (isEditing && editingProductId) {
        const updated = await updateProduct(editingProductId, payload, token);
        if (Platform.OS === "android") ToastAndroid.show("Product updated", ToastAndroid.SHORT);
        else Alert.alert("Success", "Product updated");
      } else {
        const created = await createProduct(payload, token);
        if (Platform.OS === "android") ToastAndroid.show("Product created", ToastAndroid.SHORT);
        else Alert.alert("Success", "Product created");
      }

      setFormModalVisible(false);
      fetchProducts(); // refresh list
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save product");
    }
  };

  const handleRemovePress = (productId: number) => {
    setSelectedProductId(productId);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (selectedProductId) {
      await deleteProduct(selectedProductId, token || "");
      setDeleteModalVisible(false);
      setSelectedProductId(null);
    }
  };

  // Refresh when screen focused
  useFocusEffect(
    useCallback(() => {
      fetchProducts({ search, minPrice, maxPrice, page: 1, limit: pagination.limit });
      setPage(1);
    }, [user, search, minPrice, maxPrice])
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Products</Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          {user?.role === "ADMIN" && (
            <TouchableOpacity onPress={openCreateModal} style={{ marginRight: 10 }}>
              <Octicons name="diff-added" size={20} color={theme.text} />
            </TouchableOpacity>
          )}

          {user && (
            <TouchableOpacity onPress={() => setLogoutModal(true)}>
              <Octicons name="sign-out" size={22} color={theme.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* search + filter */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search products..."
          placeholderTextColor={theme.text + "70"}
          style={[styles.searchInput, { color: theme.text, borderColor: theme.border }]}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
        />

        <TouchableOpacity onPress={() => setPriceModal(true)} style={styles.filterButton}>
          <Octicons name="sliders" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* content */}
      {loading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={[styles.skeleton, { backgroundColor: theme.card, borderColor: theme.border }]} />
        ))
      ) : products.length === 0 ? (
        <View style={styles.empty}>
          <Octicons name="alert" size={28} color={theme.text} />
          <Text style={{ color: theme.text, marginVertical: 8 }}>No products found</Text>
          <TouchableOpacity onPress={() => fetchProducts()} style={styles.refreshBtn}>
            <Text style={{ color: "white" }}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Animated.View entering={FadeInUp} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <TouchableOpacity onPress={() => openDetails(item)} style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                  <Text style={[styles.detail, { color: theme.subtle }]} numberOfLines={2}>
                    {item.description.slice(0, 35) + `...`}
                  </Text>
                </View>

                <Text style={[styles.price, { color: theme.accent }]}>₦{Number(item.price).toLocaleString()}</Text>
              </TouchableOpacity>

              <View style={{ marginTop: 8, flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
                {user?.role === "ADMIN" ? (
                  <>
                    <TouchableOpacity onPress={() => openEditModal(item)} style={[styles.adminBtn, { backgroundColor: "#4CAF50" }]}>
                      <Octicons name="pencil" size={16} color="#fff" />
                      <Text style={styles.adminBtnText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleRemovePress(item.id)} style={[styles.adminBtn, { backgroundColor: "#D9534F" }]}>
                      <Octicons name="trash" size={16} color="#fff" />
                      <Text style={styles.adminBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity onPress={() => handleAddToCart(item.id)} style={styles.addBtn}>
                    <Octicons name="plus-circle" size={18} color="#fff" />
                    <Text style={styles.addText}>Add to Cart</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          )}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.6}
          itemLayoutAnimation={LinearTransition}
        />
      )}

      {/* PRICE FILTER MODAL */}
      <Modal visible={priceModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Filter by Price</Text>
            <TextInput
              placeholder="Min Price"
              placeholderTextColor={theme.text + "70"}
              keyboardType="numeric"
              style={[styles.modalInput, { borderColor: theme.border, color: theme.text }]}
              value={minPrice?.toString() || ""}
              onChangeText={(v) => setMinPrice(v ? Number(v) : undefined)}
            />
            <TextInput
              placeholder="Max Price"
              placeholderTextColor={theme.text + "70"}
              keyboardType="numeric"
              style={[styles.modalInput, { borderColor: theme.border, color: theme.text }]}
              value={maxPrice?.toString() || ""}
              onChangeText={(v) => setMaxPrice(v ? Number(v) : undefined)}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setPriceModal(false)}>
                <Text style={{ color: theme.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleSearch();
                  setPriceModal(false);
                }}
              >
                <Text style={{ color: theme.accent, fontWeight: "600" }}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* PRODUCT DETAIL MODAL */}
      <Modal visible={detailModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            {selectedProduct ? (
              <>
                <Text style={[styles.modalTitle, { color: theme.text }]}>{selectedProduct.name}</Text>

                {user?.role !== "ADMIN" && (
                  <Text style={[styles.detail, { color: theme.subtle, marginBottom: 8 }]}>
                    Product ID: #{selectedProduct.id}
                  </Text>
                )}

                <View style={styles.imageWrapper}>
                  <Image source={{ uri: selectedProduct.imageUrl }} style={styles.productImage} resizeMode="cover" />
                </View>

                <Text style={[styles.detail, { color: theme.text, marginTop: 8 }]}>{selectedProduct.description}</Text>

                <Text style={[styles.detail, { color: theme.accent, marginTop: 10 }]}>
                  Price: ₦{Number(selectedProduct.price).toLocaleString()}
                </Text>

                <Text style={[styles.detail, { color: theme.text, marginTop: 4 }]}>
                  In Stock: {selectedProduct.stockQuantity}
                </Text>

                {user?.role !== "ADMIN" && (
                  <>
                    <Text style={[styles.date, { color: theme.subtle, marginTop: 8 }]}>
                      Created: {new Date(selectedProduct.createdAt).toDateString()}
                    </Text>
                    <Text style={[styles.date, { color: theme.subtle, marginTop: 4 }]}>
                      Updated: {new Date(selectedProduct.updatedAt).toDateString()}
                    </Text>
                  </>
                )}

                <TouchableOpacity style={[styles.closeBtn, { backgroundColor: theme.accent }]} onPress={() => setDetailModalVisible(false)}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={[styles.detail, { color: theme.text }]}>No product selected.</Text>
            )}
          </View>
        </View>
      </Modal>

      {/* CREATE / EDIT PRODUCT FORM MODAL (ADMIN) */}
      <Modal visible={formModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ width: "100%", alignItems: "center" }}>
            <Animated.View entering={FadeInUp} style={[styles.modalBox, { backgroundColor: theme.card }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{isEditing ? "Edit Product" : "Create Product"}</Text>

              <ScrollView style={{ maxHeight: 320, width: "100%" }} keyboardShouldPersistTaps="handled">
                <TextInput
                  placeholder="Name"
                  placeholderTextColor={theme.text + "70"}
                  style={[styles.modalInput, { borderColor: theme.border, color: theme.text }]}
                  value={form.name}
                  onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
                />
                <TextInput
                  placeholder="Description"
                  placeholderTextColor={theme.text + "70"}
                  style={[styles.modalInput, { borderColor: theme.border, color: theme.text }]}
                  value={form.description}
                  onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
                />
                <TextInput
                  placeholder="Price"
                  placeholderTextColor={theme.text + "70"}
                  keyboardType="numeric"
                  style={[styles.modalInput, { borderColor: theme.border, color: theme.text }]}
                  value={form.price}
                  onChangeText={(v) => setForm((p) => ({ ...p, price: v }))}
                />
                <TextInput
                  placeholder="Stock Quantity"
                  placeholderTextColor={theme.text + "70"}
                  keyboardType="numeric"
                  style={[styles.modalInput, { borderColor: theme.border, color: theme.text }]}
                  value={form.stockQuantity}
                  onChangeText={(v) => setForm((p) => ({ ...p, stockQuantity: v }))}
                />
                <TextInput
                  placeholder="Image URL (optional)"
                  placeholderTextColor={theme.text + "70"}
                  style={[styles.modalInput, { borderColor: theme.border, color: theme.text }]}
                  value={form.imageUrl}
                  onChangeText={(v) => setForm((p) => ({ ...p, imageUrl: v }))}
                />
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setFormModalVisible(false)}>
                  <Text style={{ color: theme.text }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSubmitForm}>
                  <Text style={{ color: theme.accent, fontWeight: "600" }}>{isEditing ? "Update" : "Create"}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

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
                onPress={handleDelete}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 12 },
  searchContainer: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  filterButton: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  skeleton: {
    height: 100,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
    opacity: 0.5,
  },
  card: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 18, fontWeight: "500" },
  price: { fontSize: 16 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    justifyContent: "center",
  },
  addText: { color: "#fff", marginLeft: 6 },
  adminBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  adminBtnText: { color: "#fff", marginLeft: 6, fontWeight: "600" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 40 },
  refreshBtn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "92%",
    borderRadius: 10,
    padding: 18,
    maxHeight: 520,
  },
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 44,
    marginBottom: 10,
  },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    width: "85%",
    padding: 18,
    borderRadius: 10,
  },
  modalContainer: {
    width: "80%",
    borderRadius: 10,
    padding: 20,
    elevation: 10,
  },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  modalBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  detail: { fontSize: 15, marginTop: 4 },
  closeBtn: {
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  closeText: { color: "#fff", fontWeight: "600" },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  imageWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  productImage: {
    width: 160,
    height: 160,
    borderRadius: 12,
  },
  date: {
    fontSize: 13,
    marginTop: 6,
    fontStyle: "italic",
    fontWeight: "500",
    opacity: 0.8,
  },
});
