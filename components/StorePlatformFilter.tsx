"use client"

import * as React from "react"
import { FaSteam } from "react-icons/fa"
import { SiEpicgames } from "react-icons/si"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface StorePlatformFilterProps {
  onPlatformChange: (platforms: string[]) => void
  initialValue?: string[]
}

const StorePlatformFilter = ({
  onPlatformChange,
  initialValue = ["epic", "steam"],
}: StorePlatformFilterProps) => {
  const handleValueChange = (value: string[]) => {
    // En az bir platform seçili olmalı
    const newValue = value.length ? value : initialValue
    onPlatformChange(newValue)
  }

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="platform-filter" className="text-sm font-medium text-gray-700">
        Platform
      </label>
      <ToggleGroup
        type="multiple"
        defaultValue={initialValue}
        onValueChange={handleValueChange}
        id="platform-filter"
        className="inline-flex"
        aria-label="Platform Seçin"
      >
        <ToggleGroupItem value="epic" aria-label="Epic Games" title="Epic Games">
          <SiEpicgames className="h-4 w-4 mr-1" />
          <span>Epic</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="steam" aria-label="Steam" title="Steam">
          <FaSteam className="h-4 w-4 mr-1" />
          <span>Steam</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}

export default StorePlatformFilter 