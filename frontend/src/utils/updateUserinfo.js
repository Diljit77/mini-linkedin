export const updatedUser= async () => {
    try {
        const res=await AxiosInstance.get('/auth/me');
        const updatedUser = res.user;
        localStorage.setItem("user", JSON.stringify(updatedUser));
  return updatedUser;

    } catch (error) {
        console.error("Error updating user info:", error);
    }
}