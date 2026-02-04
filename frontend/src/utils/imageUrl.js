const API_URL = "https://cuvette-january-mern-final-evaluation.onrender.com";

export function getImageUrl(image) {
  if (!image) return null;

  // already absolute (CSV imageUrl)
  if (image.startsWith("http")) return image;

  // backend uploaded image
  return `${API_URL}${image}`;
}
