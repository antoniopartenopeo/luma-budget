import { useState, useMemo, useTransition } from "react"
import type { PreviewRow, MerchantGroupV2, AmountSubgroup, GroupsV2Result } from "../types"
import { DEFAULT_SIGNIFICANCE_THRESHOLD_CENTS } from "../types"
import {
    computeGroupsV2,
    applyCategoryToGroupV2,
    applyCategoryToSubgroup,
    splitSubgroup,
    mergeSubgroup,
    setGroupSelected
} from "../grouping-utils-v2"
import { generatePatternKey } from "../normalization-utils"

interface ReturnType {
    // State
    thresholdCents: number
    sliderValue: number
    groups: GroupsV2Result
    selectedGroup: MerchantGroupV2 | null
    expandedGroups: Set<string>
    stats: {
        totalGroups: number
        significantGroups: number
        lessSignificantGroups: number
        selectedRows: number
        expenseTotal: number
        incomeTotal: number
    }
    isPending: boolean

    // Actions
    setSliderValue: (val: number) => void
    commitThreshold: (val: number) => void
    toggleExpand: (patternKey: string) => void
    selectGroup: (group: MerchantGroupV2 | null) => void
    updateGroupCategory: (group: MerchantGroupV2, categoryId: string) => void
    updateSubgroupCategory: (subgroup: AmountSubgroup, categoryId: string) => void
    splitSubgroupAction: (group: MerchantGroupV2, amountCents: number) => void
    mergeSubgroupAction: (group: MerchantGroupV2, amountCents: number) => void
    toggleGroupSelection: (group: MerchantGroupV2, selected: boolean) => void
    handleIncludeAllLessSignificant: () => void
    toggleRow: (rowIndex: number) => void
}

export function useImportPreviewLogic(
    rows: PreviewRow[],
    onRowsChange: (rows: PreviewRow[]) => void,
    onToggleRow: (rowIndex: number) => void
): ReturnType {
    const [thresholdCents, setThresholdCents] = useState(DEFAULT_SIGNIFICANCE_THRESHOLD_CENTS)
    const [sliderValue, setSliderValue] = useState(DEFAULT_SIGNIFICANCE_THRESHOLD_CENTS)
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
    const [groupsV2State, setGroupsV2State] = useState<Map<string, MerchantGroupV2>>(new Map())
    const [selectedGroup, setSelectedGroup] = useState<MerchantGroupV2 | null>(null)
    const [isPending, startTransition] = useTransition()

    // Compute groups
    const baseGroups = useMemo(() =>
        computeGroupsV2(rows, { thresholdCents }),
        [rows, thresholdCents]
    )

    // Apply local state overrides
    const groups: GroupsV2Result = useMemo(() => {
        const applyState = (grpList: MerchantGroupV2[]): MerchantGroupV2[] => {
            return grpList.map(g => {
                const override = groupsV2State.get(g.patternKey)
                if (!override) return g

                return {
                    ...override,
                    assignedCategoryId: g.assignedCategoryId, // Always take fresh category from rows
                    totalAbsCents: g.totalAbsCents,           // Always take fresh totals
                    count: g.count,                           // Always take fresh count
                    isGroupSelected: override.isGroupSelected,
                    subgroups: g.subgroups.map(sg => {
                        const overrideSg = override.subgroups.find(osg => osg.amountCents === sg.amountCents)
                        return overrideSg ? { ...sg, isSplit: overrideSg.isSplit } : sg
                    })
                }
            })
        }
        return {
            income: applyState(baseGroups.income),
            expense: applyState(baseGroups.expense),
            all: applyState(baseGroups.all)
        }
    }, [baseGroups, groupsV2State])

    // Update selected group reference when it changes in the list
    // This ensures detail view has fresh data
    const activeSelectedGroup = useMemo(() => {
        if (!selectedGroup) return null
        return groups.all.find(g => g.patternKey === selectedGroup.patternKey) || null
    }, [groups.all, selectedGroup])

    // Stats
    const stats = useMemo(() => {
        const selectedRows = rows.filter(r => r.isSelected && r.isValid)
        const significantGroups = groups.all.filter(g => g.isSignificant)
        const lessSignificantGroups = groups.all.filter(g => !g.isSignificant)

        return {
            totalGroups: groups.all.length,
            significantGroups: significantGroups.length,
            lessSignificantGroups: lessSignificantGroups.length,
            selectedRows: selectedRows.length,
            expenseTotal: groups.expense.reduce((sum, g) => sum + g.totalAbsCents, 0),
            incomeTotal: groups.income.reduce((sum, g) => sum + g.totalAbsCents, 0)
        }
    }, [groups, rows])


    // Helpers
    const updateGroupState = (patternKey: string, updater: (g: MerchantGroupV2) => MerchantGroupV2) => {
        const currentGroup = groups.all.find(g => g.patternKey === patternKey)
        if (!currentGroup) return
        const updated = updater(currentGroup)
        setGroupsV2State(prev => new Map(prev).set(patternKey, updated))
    }

    // Actions
    const commitThreshold = (val: number) => {
        const newThreshold = val
        startTransition(() => {
            setThresholdCents(newThreshold)

            // Auto-exclude logic
            const groupMap = new Map<string, number>()
            rows.forEach(row => {
                const { patternKey } = generatePatternKey(row.description, row.type)
                const current = groupMap.get(patternKey) || 0
                groupMap.set(patternKey, current + Math.abs(row.amountCents))
            })

            const updatedRows = rows.map(row => {
                const { patternKey } = generatePatternKey(row.description, row.type)
                const totalAbs = groupMap.get(patternKey) || 0
                const isSignificant = totalAbs >= newThreshold
                return {
                    ...row,
                    isSelected: isSignificant && row.isValid
                }
            })
            onRowsChange(updatedRows)
        })
    }

    const toggleExpand = (patternKey: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev)
            if (next.has(patternKey)) next.delete(patternKey)
            else next.add(patternKey)
            return next
        })
    }

    const updateGroupCategory = (group: MerchantGroupV2, categoryId: string) => {
        startTransition(() => {
            const updatedRows = applyCategoryToGroupV2(rows, group, categoryId)
            onRowsChange(updatedRows)
        })
    }

    const updateSubgroupCategory = (subgroup: AmountSubgroup, categoryId: string) => {
        startTransition(() => {
            const updatedRows = applyCategoryToSubgroup(rows, subgroup, categoryId)
            onRowsChange(updatedRows)
        })
    }

    const splitSubgroupAction = (group: MerchantGroupV2, amountCents: number) => {
        updateGroupState(group.patternKey, g => splitSubgroup(g, amountCents))
    }

    const mergeSubgroupAction = (group: MerchantGroupV2, amountCents: number) => {
        updateGroupState(group.patternKey, g => mergeSubgroup(g, amountCents))
    }

    const toggleGroupSelection = (group: MerchantGroupV2, selected: boolean) => {
        updateGroupState(group.patternKey, g => setGroupSelected(g, selected))
        startTransition(() => {
            const updatedRows = rows.map(row => {
                if (group.rowIndices.includes(row.rowIndex)) {
                    return { ...row, isSelected: selected }
                }
                return row
            })
            onRowsChange(updatedRows)
        })
    }

    const handleIncludeAllLessSignificant = () => {
        const lessSig = groups.all.filter(g => !g.isSignificant)
        lessSig.forEach(group => {
            toggleGroupSelection(group, true)
        })
    }

    const toggleRow = (index: number) => {
        startTransition(() => onToggleRow(index))
    }

    return {
        thresholdCents,
        sliderValue,
        groups,
        selectedGroup: activeSelectedGroup,
        expandedGroups,
        stats,
        isPending,
        setSliderValue,
        commitThreshold,
        toggleExpand,
        selectGroup: setSelectedGroup,
        updateGroupCategory,
        updateSubgroupCategory,
        splitSubgroupAction,
        mergeSubgroupAction,
        toggleGroupSelection,
        handleIncludeAllLessSignificant,
        toggleRow
    }
}
