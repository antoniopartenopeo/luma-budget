"use client"

import { useCategories } from "../api/use-categories"

interface CategoryLabelProps {
    id?: string
    fallback: string
    className?: string
}

export function CategoryLabel({ id, fallback, className }: CategoryLabelProps) {
    const { data: categories = [] } = useCategories({ includeArchived: true })

    // Virtual Join: specific ID match > fallback string match > fallback
    const category = id
        ? categories.find(c => c.id === id)
        : categories.find(c => c.label === fallback || c.id === fallback)

    const label = category ? category.label : fallback

    return <span className={className}>{label}</span>
}
