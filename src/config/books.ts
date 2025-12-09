export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  routeIdentifier: string; // The identifier used in /read/[identifier] route
  description: string;
  price: number;
  currency: string;
}

export const BOOKS: Record<string, Book> = {
  "book-hanis-assassin": {
    id: "book-hanis-assassin",
    title: "Hani's Assassin",
    author: "Nicole Barlow",
    cover: "/images/cover-hanis-assassin.jpg",
    routeIdentifier: "hanis-assassin",
    description: "Who killed Chris Hani? The convicted perpetrators were Janusz Waluś and right-wing sympathiser Clive Derby-Lewis, who both claimed during their trial and before the Truth and Reconciliation Commission that they acted alone. However, there have long been suspicions of other sinister influences and the possibility that a foreign power manipulated them. Nicole Barlow delves deeply into these suspicions and uncovers some startling revelations, prompted by an anonymous phone call from a whistleblower with insider knowledge. This fast-paced narrative explores not only the assassination itself, which brought South Africa to the brink of civil war, but also the peculiar reluctance of the South African security services to investigate thoroughly. Essential reading for those interested in South Africa's history and the roots of corruption.",
    price: 179,
    currency: "ZAR",
  },
  "book-fuelling-environmental-corruption": {
    id: "book-fuelling-environmental-corruption",
    title: "Fuelling Environmental Corruption",
    author: "Nicole Barlow",
    cover: "/images/cover-fuelling-environmental-corruption.JPG",
    routeIdentifier: "fuelling-environmental-corruption",
    description: "Her exploits earned her the moniker 'the Brockovich of Boksburg' by the Mail and Guardian. This memoir chronicles Nicole's 18-year struggle to expose the corrupt relationship between officials at the former Gauteng Department of Agriculture, Conservation and Environment (GDACE), and the developers of a British Petroleum fuel station. It demonstrates how such corruption devastates the environment, contaminates water resources, and destroys lives. The book reveals a broader spectrum of criminal activities, including bribery, secret meetings, court battles, arson and even murder.",
    price: 179,
    currency: "ZAR",
  },
} as const;

/**
 * Get a book by its unique ID
 */
export function getBookById(bookId: string): Book | undefined {
  return BOOKS[bookId];
}

/**
 * Get a book by its route identifier (used in /read/[identifier])
 */
export function getBookByRouteIdentifier(routeIdentifier: string): Book | undefined {
  return Object.values(BOOKS).find((book) => book.routeIdentifier === routeIdentifier);
}

/**
 * Get all books as an array
 */
export function getAllBooks(): Book[] {
  return Object.values(BOOKS);
}

/**
 * Get book ID from route identifier
 */
export function getBookIdFromRouteIdentifier(routeIdentifier: string): string | undefined {
  const book = getBookByRouteIdentifier(routeIdentifier);
  return book?.id;
}

