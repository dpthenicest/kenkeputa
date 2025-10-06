import { useState, useContext } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, loading } = useAuth();
  const { theme, colorScheme } = useContext(ThemeContext);
  const router = useRouter();

  const handleRegister = async () => {
    try {
      await register( fullName, email, password );
      router.replace("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const styles = createStyles(theme, colorScheme);

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.linkText}>Already have an account? <Text style={{color: 'skyblue'}}>Login</Text></Text>
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
  });
