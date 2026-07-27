"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  disabledValues?: Set<string>;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  className,
  disabled,
  disabledValues,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [coords, setCoords] = React.useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
  } | null>(null);
  const [mounted, setMounted] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const updateCoords = React.useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpwards = spaceBelow < 220 && rect.top > spaceBelow;

      setCoords({
        top: openUpwards ? undefined : rect.bottom + 4,
        bottom: openUpwards ? window.innerHeight - rect.top + 4 : undefined,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      updateCoords();
      const handleScrollOrResize = () => updateCoords();
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
      return () => {
        window.removeEventListener("scroll", handleScrollOrResize, true);
        window.removeEventListener("resize", handleScrollOrResize);
      };
    }
  }, [isOpen, updateCoords]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          onValueChange(options[highlightedIndex].value);
          setIsOpen(false);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex((prev) =>
            prev < options.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const dropdownMenu =
    isOpen && mounted && coords
      ? createPortal(
          <div
            ref={listRef}
            role="listbox"
            style={{
              position: "fixed",
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom:
                coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
            }}
            className={cn(
              "z-[9999] max-h-56 overflow-y-auto rounded-lg border bg-popover text-popover-foreground p-1 shadow-2xl animate-in fade-in-0 zoom-in-95"
            )}
          >
            {options.map((option, index) => {
              const isOptionDisabled =
                disabledValues?.has(option.value) && option.value !== value;
              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  aria-disabled={isOptionDisabled}
                  className={cn(
                    "relative flex select-none items-center gap-2 rounded-sm px-3 py-2 text-sm outline-none transition-colors",
                    isOptionDisabled
                      ? "cursor-not-allowed opacity-40"
                      : "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                    option.value === value &&
                      "bg-accent text-accent-foreground font-medium",
                    index === highlightedIndex &&
                      !isOptionDisabled &&
                      "bg-accent text-accent-foreground"
                  )}
                  onClick={() => {
                    if (isOptionDisabled) return;
                    onValueChange(option.value);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() =>
                    !isOptionDisabled && setHighlightedIndex(index)
                  }
                >
                  {option.icon && (
                    <span className="flex-shrink-0">{option.icon}</span>
                  )}
                  <span className="truncate">{option.label}</span>
                </div>
              );
            })}
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex h-9 sm:h-10 w-full items-center justify-between rounded-md border border-input bg-background px-2.5 sm:px-3 py-2 text-xs sm:text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "ring-2 ring-ring ring-offset-2"
        )}
      >
        <span className="flex items-center gap-1.5 sm:gap-2 truncate">
          {selectedOption?.icon && (
            <span className="flex-shrink-0">{selectedOption.icon}</span>
          )}
          {selectedOption?.label || (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 flex-shrink-0 opacity-50 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {dropdownMenu}
    </div>
  );
}
