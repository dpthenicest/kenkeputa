import { useAuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const { user, token, loading, login, register, logout } = useAuthContext();
  return { user, token, loading, login, register, logout };
};
