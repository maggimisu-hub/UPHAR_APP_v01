import type { Address, Product, Testimonial } from "../types";

export const products: Product[] = [
  {
    id: "mn-kundan-bridal-01",
    name: "Kundan Bridal Necklace Set",
    price: 119990,
    images: [
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1200&q=80",
    ],
    category: "men",
    sizes: ["16 in", "18 in", "20 in"],
    description: "A ceremonial kundan necklace set with matching earrings, arranged for bridal dressing and heirloom gifting.",
    tag: "Bridal Set",
    featured: true,
  },
  {
    id: "mn-polki-choker-02",
    name: "Polki Choker Set",
    price: 89990,
    images: [
      "https://images.unsplash.com/photo-1603974372039-adc49044b6bd?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?auto=format&fit=crop&w=1200&q=80",
    ],
    category: "men",
    sizes: ["14 in", "16 in", "18 in"],
    description: "A close-set polki choker with matching drops, designed for wedding ceremonies and festive layering.",
    tag: "New Arrival",
    newArrival: true,
  },
  {
    id: "mn-lotus-jhumka-03",
    name: "Lotus Jhumka Pair",
    price: 44990,
    images: [
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=1200&q=80",
    ],
    category: "men",
    sizes: ["Standard", "Long Drop"],
    description: "A carved lotus jhumka silhouette with a warm gold finish and a balanced ceremonial swing.",
    tag: "Signature",
    featured: true,
  },
  {
    id: "mn-bridal-bangles-04",
    name: "Temple Bridal Bangles",
    price: 65990,
    images: [
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=1200&q=80",
    ],
    category: "men",
    sizes: ["2.4", "2.6", "2.8"],
    description: "A temple-inspired bangle pair with sculpted detailing, built to sit beautifully within a bridal stack.",
    tag: "Wedding Style",
    newArrival: true,
  },
  {
    id: "wm-emerald-necklace-05",
    name: "Emerald Drop Necklace",
    price: 52490,
    images: [
      "https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1603561596112-db7f6c7edb8a?auto=format&fit=crop&w=1200&q=80",
    ],
    category: "women",
    sizes: ["16 in", "18 in", "20 in"],
    description: "A refined necklace with an emerald-toned drop and light-catching stones for festive evening dressing.",
    tag: "Featured",
    featured: true,
  },
  {
    id: "wm-rose-bangles-06",
    name: "Rose Gold Bangles",
    price: 38990,
    images: [
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=80",
    ],
    category: "women",
    sizes: ["2.4", "2.6", "2.8"],
    description: "Rose gold bangles with a soft polished finish, made for gifting and understated daily wear.",
    tag: "New Arrival",
    newArrival: true,
  },
  {
    id: "wm-pearl-studs-07",
    name: "Pearl Drop Earrings",
    price: 26990,
    images: [
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?auto=format&fit=crop&w=1200&q=80",
    ],
    category: "women",
    sizes: ["Standard"],
    description: "Minimal pearl drop earrings shaped for refined gifting, ceremonies, and evening celebrations.",
    tag: "Signature",
    featured: true,
  },
  {
    id: "wm-festive-chandbali-08",
    name: "Festive Chandbali Pair",
    price: 31990,
    images: [
      "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80",
    ],
    category: "women",
    sizes: ["Standard", "Extended Drop"],
    description: "A chandbali pair with festive detailing, balanced weight, and a softly luminous finish.",
    tag: "Trending",
    newArrival: true,
  },
];

export const starterAddresses: Address[] = [
  {
    id: "addr-home",
    label: "Home",
    name: "Aarav Mehta",
    phone: "9876543210",
    line1: "22 Heritage Lane, Civil Lines",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302006",
    isDefault: true,
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Aanya Mehra",
    city: "Mumbai",
    quote: "The finish feels elevated and the presentation is beautiful from the first unboxing moment.",
  },
  {
    id: "t2",
    name: "Karan Sethi",
    city: "Delhi",
    quote: "Minimal design done right. Every set feels festive without becoming overwhelming.",
  },
  {
    id: "t3",
    name: "Riya Kapoor",
    city: "Bengaluru",
    quote: "I ordered one bridal set and came back for gifting pieces. The whole experience feels intentional.",
  },
  {
    id: "t4",
    name: "Vikram Rao",
    city: "Hyderabad",
    quote: "The craftsmanship reads clearly on mobile, and the checkout experience feels calm and premium.",
  },
  {
    id: "t5",
    name: "Sara Thomas",
    city: "Pune",
    quote: "The product pages are thoughtful, the packaging is elegant, and the brand language feels cohesive.",
  },
];
