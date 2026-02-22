import { WordData } from "../types";

export class TDKService {
  private static BASE_URL = "/api/tdk";

  static async searchWord(query: string): Promise<WordData[]> {
    if (!query.trim()) {
      throw new Error("Arama terimi boş olamaz.");
    }

    try {
      const response = await fetch(`${this.BASE_URL}?q=${encodeURIComponent(query.trim())}`);
      
      if (!response.ok) {
        throw new Error(`API hatası: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Kelime bulunamadı.");
      }

      return data as WordData[];
    } catch (error: any) {
      console.error("TDK Service Error:", error);
      throw error instanceof Error ? error : new Error("Bilinmeyen bir hata oluştu.");
    }
  }
}
