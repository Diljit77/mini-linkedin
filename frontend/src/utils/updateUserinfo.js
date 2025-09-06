import { currentUser } from "./api";

export async function updatedUser() {
  try {
    const res = await currentUser(); 
    if (res) {
      
      setUser(res);

 
      localStorage.setItem("user", JSON.stringify(res));
    }
  } catch (error) {
    console.error("Failed to refresh user:", error);
  }
}
