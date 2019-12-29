
export interface CollectionProperties {
  displayName: string;
  id: string;
  description?: string;
  longDescription: string;
  seoMetaInfo: {
    seoDescription?: string,
    seoKeywords?: string,
    seoTitle?: string,
    seoUrlSlug?: string,
  };
  active: boolean | null;
}

export interface Collection extends CollectionProperties {
  categoryImages?: string[];
  categoryPaths?: string[];
  categoryIdPaths?: string[];
  childCategories?: string[];
  fixedParentCategories?: Collection[];
  creationDate: string;
  route: string;
  repositoryId: string;
  links?: any;
}

export interface CollectionBody {
  parentCategoryIds?: string[];
  catalogId?: string;
  /**
   * List of category images to assign to the Collection.
   */
  categoryImages?: {
    metadata: {
      altText: string,
      titleText: string,
    },
  };
  /**
   * Move the group of products at indices 5-10 (inclusive) to appear starting at index 2
   * (shorthand for 'move product 5 to index 2, product 6 to index 3, etc.')
   * {'op': 'move', 'fromStart': 5, 'fromEnd': 10, 'to' : 2}
   */
  moves?: Array<{ fromEnd: number; fromStart: number; to: number; }>;
  /**
   * if type is appendProducts, or type is updateProducts and op is remove,
   * then this value is equal to the list of IDs for child products that will be appened or removed.
   */
  products?: string[];
  /**
   * Operation to perform if updating childProducts property. Can be one of: reorder, remove, move.
   */
  op?: string;
  /**
   * The type of update operation, appendProducts or updateProducts.
   */
  type?: string;
  repositoryId?: string;
  /**
   * List of properties of the collection.
   */
  properties: CollectionProperties;
}

export interface CollectionRequestParams {
  language: string;
  collection: CollectionBody;
}
