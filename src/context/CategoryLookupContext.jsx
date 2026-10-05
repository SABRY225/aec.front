import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { categoryService } from '../services/new-api';
import { useLanguage } from '../hooks/useLanguage';

const CategoryLookupContext = createContext(null);

function matchesStoredValue(item, value) {
  if (!item || value == null || value === '') return false;
  const v = String(value).trim().toLowerCase();
  return [item.slug, item.nameEn, item.nameAr]
    .filter(Boolean)
    .some((field) => String(field).trim().toLowerCase() === v);
}

function pickLocalizedName(item, language) {
  if (!item) return null;
  if (language === 'ar') {
    return item.nameAr || item.nameEn || null;
  }
  return item.nameEn || item.nameAr || null;
}

export const CategoryLookupProvider = ({ children }) => {
  const { language } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await categoryService.getCategories();
        if (!cancelled && response?.success && Array.isArray(response.data)) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Failed to load categories for localization:', error);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const localizeCategory = useCallback(
    (value) => {
      if (value == null || value === '') return '';
      const match = categories.find((cat) => matchesStoredValue(cat, value));
      return pickLocalizedName(match, language) || String(value);
    },
    [categories, language]
  );

  const localizeSubcategory = useCallback(
    (value, categoryHint) => {
      if (value == null || value === '') return '';

      let searchSpace = categories;
      if (categoryHint) {
        const parent = categories.find((cat) => matchesStoredValue(cat, categoryHint));
        if (parent?.subcategories?.length) {
          searchSpace = [parent];
        }
      }

      for (const cat of searchSpace) {
        const sub = (cat.subcategories || []).find((s) => matchesStoredValue(s, value));
        if (sub) {
          return pickLocalizedName(sub, language) || String(value);
        }
      }

      return String(value);
    },
    [categories, language]
  );

  const localizeCategoryPath = useCallback(
    (category, subCategory) => {
      const catLabel = localizeCategory(category);
      const subLabel = localizeSubcategory(subCategory, category);
      if (catLabel && subLabel) return `${catLabel} / ${subLabel}`;
      return catLabel || subLabel || '';
    },
    [localizeCategory, localizeSubcategory]
  );

  const getCategoryOptions = useCallback(() => {
    return categories.map((category) => ({
      value: category.slug,
      id: category._id,
      label: pickLocalizedName(category, language) || category.nameEn,
      nameEn: category.nameEn,
      nameAr: category.nameAr,
      slug: category.slug,
    }));
  }, [categories, language]);

  const getSubcategoryOptions = useCallback(
    (categoryValue) => {
      const parent = categories.find((cat) => matchesStoredValue(cat, categoryValue));
      if (!parent) return [];
      return (parent.subcategories || []).map((sub) => ({
        value: sub.slug,
        id: sub._id,
        label: pickLocalizedName(sub, language) || sub.nameEn,
        nameEn: sub.nameEn,
        nameAr: sub.nameAr,
        slug: sub.slug,
      }));
    },
    [categories, language]
  );

  const value = useMemo(
    () => ({
      categories,
      loaded,
      localizeCategory,
      localizeSubcategory,
      localizeCategoryPath,
      getCategoryOptions,
      getSubcategoryOptions,
    }),
    [
      categories,
      loaded,
      localizeCategory,
      localizeSubcategory,
      localizeCategoryPath,
      getCategoryOptions,
      getSubcategoryOptions,
    ]
  );

  return (
    <CategoryLookupContext.Provider value={value}>
      {children}
    </CategoryLookupContext.Provider>
  );
};

export const useCategoryLookup = () => {
  const ctx = useContext(CategoryLookupContext);
  if (!ctx) {
    throw new Error('useCategoryLookup must be used within CategoryLookupProvider');
  }
  return ctx;
};
