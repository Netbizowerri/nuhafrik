import { GoogleGenAI, Type } from "@google/genai";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generatePlaceholderProducts() {
  const prompt = `
    Generate a JSON array of 20 placeholder products for an African-inspired fashion store called "Nuhafrik".
    The products should cover these categories and subcategories:
    - Clothing: Tops, Pants & Bottoms, Dresses, Two Pieces, Jumpsuits, Lingerie, Underwear
    - Accessories: Bags, Shoes, Purse, Hats/Caps/Fascinators/Scarfs, Belts, Sunglasses, Jewelry

    Each product must follow this schema:
    {
      "sku": "string (e.g. NUH-DRS-001)",
      "name": "string",
      "slug": "string",
      "description": "string (rich text)",
      "short_description": "string",
      "category_id": "clothing" | "accessories",
      "subcategory_id": "string (slug version of subcategory)",
      "tags": ["string"],
      "images": [
        { "url": "https://picsum.photos/seed/{random}/800/1000", "alt": "string", "is_primary": true }
      ],
      "pricing": {
        "original_price": number (NGN, e.g. 15000),
        "selling_price": number (NGN),
        "is_on_sale": boolean,
        "discount_percentage": number (optional)
      },
      "variants": {
        "sizes": ["string"],
        "colors": [{ "id": "string", "name": "string", "hex": "string" }]
      },
      "metadata": {
        "is_featured": boolean,
        "is_new_arrival": boolean,
        "is_best_seller": boolean
      },
      "published": true
    }

    Ensure the names and descriptions sound premium and celebrate African heritage.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sku: { type: Type.STRING },
              name: { type: Type.STRING },
              slug: { type: Type.STRING },
              description: { type: Type.STRING },
              short_description: { type: Type.STRING },
              category_id: { type: Type.STRING },
              subcategory_id: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              images: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    url: { type: Type.STRING },
                    alt: { type: Type.STRING },
                    is_primary: { type: Type.BOOLEAN }
                  }
                }
              },
              pricing: {
                type: Type.OBJECT,
                properties: {
                  original_price: { type: Type.NUMBER },
                  selling_price: { type: Type.NUMBER },
                  is_on_sale: { type: Type.BOOLEAN },
                  discount_percentage: { type: Type.NUMBER }
                }
              },
              variants: {
                type: Type.OBJECT,
                properties: {
                  sizes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  colors: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        hex: { type: Type.STRING }
                      }
                    }
                  }
                }
              },
              metadata: {
                type: Type.OBJECT,
                properties: {
                  is_featured: { type: Type.BOOLEAN },
                  is_new_arrival: { type: Type.BOOLEAN },
                  is_best_seller: { type: Type.BOOLEAN }
                }
              },
              published: { type: Type.BOOLEAN }
            },
            required: ["sku", "name", "slug", "category_id", "subcategory_id", "pricing"]
          }
        }
      }
    });

    const products = JSON.parse(response.text);
    return products;
  } catch (error) {
    console.error("Error generating products:", error);
    return [];
  }
}
