// app/properties/getAllProperty.jsx
export async function getAllProperty() {
    try {
      const res = await fetch("https://zaminbazaar.com/properties");
      if (!res.ok) {
        throw new Error("Failed to fetch properties");
      }
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching properties:", error);
      return [];
    }
  }
  