// stores/useCharacterStore.js
import { create } from "zustand";
import apiClient from "../lib/axios"; // Your axios instance, pointing to http://localhost:5000

const useCharacterStore = create((set) => ({
  characters: [],
  loading: false,
  error: null,

  fetchCharacters: async (count = 6) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get(`/random-characters?count=${count}`);
      console.log("Fetched characters:", res.data);
      set({ characters: res.data });
    } catch (err) {
      set({ error: "Failed to fetch characters" });
    } finally {
      set({ loading: false });
    }
  },
}));

export default useCharacterStore;
