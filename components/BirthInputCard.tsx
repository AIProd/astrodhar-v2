"use client";

import { BirthInput } from "@/lib/types";
import { GeocodingResult, debouncedSearch } from "@/lib/geocoding";
import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface BirthInputCardProps {
    label: string;
    data: BirthInput;
    onChange: (data: BirthInput) => void;
    position: "left" | "right" | "center";
}

export function BirthInputCard({
    label,
    data,
    onChange,
    position,
}: BirthInputCardProps) {
    const [cityQuery, setCityQuery] = useState("");
    const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [timeInput, setTimeInput] = useState(data.time || "");
    const suggestionRef = useRef<HTMLDivElement>(null);

    // Parse date string to Date object
    const parseDate = (dateStr: string): Date | null => {
        if (!dateStr) return null;
        const [year, month, day] = dateStr.split("-").map(Number);
        if (!year || !month || !day) return null;
        return new Date(year, month - 1, day);
    };

    // Format Date to YYYY-MM-DD
    const formatDate = (date: Date | null): string => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Auto-format time input (HH:MM)
    const handleTimeChange = (value: string) => {
        // Remove non-digits except colon
        let cleaned = value.replace(/[^\d:]/g, "");

        // Remove existing colons for processing
        const digits = cleaned.replace(/:/g, "");

        // Format with colon after 2 digits
        let formatted = "";
        for (let i = 0; i < digits.length && i < 4; i++) {
            if (i === 2) formatted += ":";
            formatted += digits[i];
        }

        // Validate hours (00-23) and minutes (00-59)
        const parts = formatted.split(":");
        if (parts[0] && parseInt(parts[0]) > 23) {
            formatted = "23" + (parts[1] ? ":" + parts[1] : "");
        }
        if (parts[1] && parseInt(parts[1]) > 59) {
            formatted = parts[0] + ":59";
        }

        setTimeInput(formatted);

        // Update parent if valid time
        if (formatted.length === 5 && formatted.includes(":")) {
            onChange({ ...data, time: formatted });
        }
    };

    // Sync timeInput with data.time
    useEffect(() => {
        if (data.time && data.time !== timeInput) {
            setTimeInput(data.time);
        }
    }, [data.time]);

    const updateField = <K extends keyof BirthInput>(
        field: K,
        value: BirthInput[K]
    ) => {
        onChange({ ...data, [field]: value });
    };

    // Handle city search - more forgiving, fewer chars needed
    const handleCitySearch = (query: string) => {
        setCityQuery(query);
        // Start search at 1 character for better UX
        if (query.length >= 1) {
            setIsSearching(true);
            debouncedSearch(query, (results) => {
                setSuggestions(results);
                setShowSuggestions(true);
                setIsSearching(false);
            }, 200); // Reduced debounce for faster response
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // Handle city selection
    const handleCitySelect = (result: GeocodingResult) => {
        onChange({
            ...data,
            city: result.display_name,
            lat: result.lat,
            lon: result.lon,
        });
        setCityQuery(result.display_name);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    // Close suggestions on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionRef.current &&
                !suggestionRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const positionClass = position === "center" ? "mx-auto lg:w-5/12" : "lg:w-5/12";

    return (
        <div className={`glass-panel embossed-gold-border rounded-xl p-5 md:p-8 w-full ${positionClass} relative group hover:shadow-gold-glow transition-all duration-500`}>
            {/* Corner decoration */}
            <div
                className={`absolute top-0 ${position === "left" || position === "center" ? "left-0 border-l-2 rounded-tl-lg" : "right-0 border-r-2 rounded-tr-lg"} w-8 h-8 border-t-2 border-primary opacity-60`}
            ></div>

            {/* Label badge */}
            <div
                className={`absolute -top-4 ${position === "left" || position === "center" ? "left-8" : "right-8"} px-4 py-1 bg-gradient-to-r from-[#1a0b2e] to-[#2d1b4e] text-primary text-xs font-bold uppercase tracking-widest border border-primary/40 shadow-lg shadow-black/50 rounded-sm`}
            >
                {label}
            </div>

            <div className="flex flex-col gap-5 mt-3">
                {/* Full Name */}
                <div>
                    <label
                        htmlFor={`${label}-name`}
                        className="block text-[10px] md:text-xs font-bold text-primary/60 uppercase tracking-wider mb-1.5 ml-1"
                    >
                        Full Name
                    </label>
                    <div className="relative group/input">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/50 text-lg group-focus-within/input:text-primary transition-colors z-10">
                            person
                        </span>
                        <input
                            id={`${label}-name`}
                            type="text"
                            value={data.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            className="w-full bg-white/90 dark:bg-[#0a0518]/80 border border-primary/20 rounded-lg py-3 pl-10 pr-4 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-primary/80 focus:border-primary/80 placeholder-gray-400 dark:placeholder-gray-500 transition-all shadow-inner"
                            placeholder="Enter name"
                        />
                    </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] md:text-xs font-bold text-primary/60 uppercase tracking-wider mb-1.5 ml-1">
                            Date of Birth
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/50 text-lg z-10">
                                calendar_month
                            </span>
                            <DatePicker
                                selected={parseDate(data.date)}
                                onChange={(date: Date | null) =>
                                    updateField("date", formatDate(date))
                                }
                                dateFormat="dd-MM-yyyy"
                                showYearDropdown
                                scrollableYearDropdown
                                yearDropdownItemNumber={100}
                                showMonthDropdown
                                dropdownMode="select"
                                placeholderText="Select date"
                                maxDate={new Date()}
                                minDate={new Date(1900, 0, 1)}
                                className="w-full bg-white/90 dark:bg-[#0a0518]/80 border border-primary/20 rounded-lg py-3 pl-10 pr-4 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-primary/80 focus:border-primary/80 transition-all shadow-inner cursor-pointer"
                                calendarClassName="astro-datepicker"
                                wrapperClassName="w-full"
                                popperClassName="!z-[100]"
                                onKeyDown={(e) => e.preventDefault()}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] md:text-xs font-bold text-primary/60 uppercase tracking-wider mb-1.5 ml-1">
                            Time of Birth
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/50 text-lg z-10">
                                schedule
                            </span>
                            <input
                                type="text"
                                value={timeInput}
                                onChange={(e) => handleTimeChange(e.target.value)}
                                placeholder="14:30"
                                maxLength={5}
                                className="w-full bg-white/90 dark:bg-[#0a0518]/80 border border-primary/20 rounded-lg py-3 pl-10 pr-4 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-primary/80 focus:border-primary/80 placeholder-gray-400 dark:placeholder-gray-500 transition-all shadow-inner font-mono"
                            />
                        </div>
                        <p className="text-[9px] text-gray-500 mt-1 ml-1">24-hour format</p>
                    </div>
                </div>

                {/* City Search with Autocomplete */}
                <div className="relative" ref={suggestionRef}>
                    <label className="block text-[10px] md:text-xs font-bold text-primary/60 uppercase tracking-wider mb-1.5 ml-1">
                        City / Town / Village of Birth
                    </label>
                    <div className="relative group/input">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/50 text-lg group-focus-within/input:text-primary transition-colors z-10">
                            location_on
                        </span>
                        <input
                            type="text"
                            value={cityQuery || data.city || ""}
                            onChange={(e) => handleCitySearch(e.target.value)}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            className="w-full bg-white/90 dark:bg-[#0a0518]/80 border border-primary/20 rounded-lg py-3 pl-10 pr-10 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-primary/80 focus:border-primary/80 placeholder-gray-400 dark:placeholder-gray-500 transition-all shadow-inner"
                            placeholder="Start typing city name..."
                        />
                        {isSearching && (
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary/50 text-lg animate-spin">
                                progress_activity
                            </span>
                        )}
                    </div>

                    {/* Suggestions dropdown - proper dark/light mode */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1a0b2e] border border-primary/40 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                            {suggestions.map((result, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleCitySelect(result)}
                                    className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors border-b border-primary/10 last:border-b-0"
                                >
                                    <p className="text-sm text-gray-800 dark:text-white">{result.display_name}</p>
                                    <p className="text-[10px] text-gray-500 dark:text-primary/50">
                                        📍 {result.lat.toFixed(4)}°, {result.lon.toFixed(4)}°
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No results message */}
                    {showSuggestions &&
                        suggestions.length === 0 &&
                        cityQuery.length >= 2 &&
                        !isSearching && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1a0b2e] border border-primary/40 rounded-lg shadow-xl p-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                    No places found. Try a different spelling.
                                </p>
                            </div>
                        )}

                    {/* Show selected coordinates */}
                    {data.lat !== 0 && data.lon !== 0 && !showSuggestions && (
                        <p className="text-[10px] text-green-600 dark:text-green-400 mt-1 ml-1">
                            ✓ Selected: {data.lat.toFixed(4)}°, {data.lon.toFixed(4)}°
                        </p>
                    )}
                </div>

                {/* Timezone */}
                <div>
                    <label
                        htmlFor={`${label}-timezone`}
                        className="block text-[10px] font-bold text-primary/60 uppercase tracking-wider mb-1.5 ml-1"
                    >
                        Timezone
                    </label>
                    <select
                        id={`${label}-timezone`}
                        value={data.tz}
                        onChange={(e) => updateField("tz", e.target.value)}
                        className="w-full bg-white/90 dark:bg-[#0a0518]/80 border border-primary/20 rounded-lg py-3 px-3 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-primary/80 focus:border-primary/80 transition-all shadow-inner cursor-pointer"
                    >
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                        <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                        <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                        <option value="Australia/Sydney">Australia/Sydney (AEDT)</option>
                        <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                        <option value="Europe/Paris">Europe/Paris (CET)</option>
                        <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
