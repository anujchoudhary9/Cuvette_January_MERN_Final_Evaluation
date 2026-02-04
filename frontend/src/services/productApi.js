const API_BASE_URL = "https://cuvette-january-mern-final-evaluation-3fcr.onrender.com";

export async function getAllProducts() {
  const response = await fetch(API_BASE_URL);
  const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return data;
}

export async function buyProduct(productId, quantity) {
  const response = await fetch(`${API_BASE_URL}/buy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, quantity }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to buy product");
  }

  return data;
}


