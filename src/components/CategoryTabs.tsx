import { Category } from "../types";
import { cn } from "../lib/utils";

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryTabs({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav
        className="flex flex-wrap -mb-px space-x-4 md:space-x-8"
        aria-label="Tabs"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              selectedCategory === category.id
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
              "whitespace-nowrap border-b-2 py-4 px-2 text-sm font-medium md:px-4"
            )}
          >
            {category.name}
          </button>
        ))}
      </nav>
    </div>
  );
}
