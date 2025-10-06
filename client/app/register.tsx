import { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { Octicons } from "@expo/vector-icons";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, loading } = useAuth();
  const { theme, colorScheme } = useContext(ThemeContext);
  const router = useRouter();

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error" | null>(null);

  const handleRegister = async () => {
    try {
      await register(fullName, email, password);
      setModalType("success");
      setModalMessage("Account created successfully!");
      // setModalVisible(true);
      // setTimeout(() => setModalVisible(false), 500);
      // setTimeout(() => router.replace("/login"), 2500);
    } catch (error) {
      console.error(error);
      setModalType("error");
      setModalMessage("Registration failed. Try again.");
      setModalVisible(true);
      setTimeout(() => setModalVisible(false), 10000);
    }
  };

  const styles = createStyles(theme, colorScheme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Success/Error Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: modalType === "success" ? "#d1f7c4" : "#ffd6d6" },
            ]}
          >
            <View style={styles.modalRow}>
              <Octicons
                name={modalType === "success" ? "check-circle-fill" : "alert"}
                size={22}
                color={modalType === "success" ? "green" : "red"}
              />
              <Text
                style={[
                  styles.modalText,
                  { color: modalType === "success" ? "green" : "red" },
                ]}
              >
                {modalMessage}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Octicons name="x" size={20} color="gray" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Store Logo */}
      <Image
        source={require("@/assets/images/stores_logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="gray"
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="gray"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="gray"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.push("/login")}>
        <Text style={styles.linkText}>
          Already have an account?{" "}
          <Text style={{ color: "skyblue" }}>Login</Text>
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, colorScheme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    logo: {
      width: 100,
      height: 100,
      marginBottom: 10,
    },
    title: {
      fontSize: 26,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 20,
    },
    input: {
      width: "100%",
      borderColor: "gray",
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 15,
      color: theme.text,
    },
    button: {
      width: "100%",
      backgroundColor: theme.button,
      padding: 14,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 10,
    },
    buttonText: {
      color: colorScheme === "dark" ? "black" : "white",
      fontSize: 18,
      fontWeight: "600",
    },
    linkText: {
      color: theme.text,
      marginTop: 10,
      fontSize: 16,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      marginTop: 40,
    },
    modalContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 8,
      width: "90%",
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    modalRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    modalText: {
      flex: 1,
      fontSize: 16,
      marginLeft: 10,
    },
  });
