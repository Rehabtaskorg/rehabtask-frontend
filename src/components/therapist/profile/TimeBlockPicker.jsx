"use client";

import DatePicker from "react-datepicker";
import { parse, format } from "date-fns";
import { MdClose } from "react-icons/md";
import "react-datepicker/dist/react-datepicker.css";

const TimeBlockPicker = ({ startTime, endTime, onChange, onRemove }) => {
    const parseTime = (timeStr) => {
        if (!timeStr) return null;
        return parse(timeStr, "HH:mm", new Date());
    };

    const handleChange = (field, date) => {
        if (!date) return;
        onChange(field, format(date, "HH:mm"));
    };

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
                <DatePicker
                    selected={parseTime(startTime)}
                    onChange={(date) => handleChange("startTime", date)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    dateFormat="hh:mm aa"
                    timeCaption="Start"
                    className="w-30 bg-input-light  border border-border-light  rounded-lg px-3 py-2 text-text-main  text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
            </div>

            <span className="text-text-muted text-sm">to</span>

            <div className="relative">
                <DatePicker
                    selected={parseTime(endTime)}
                    onChange={(date) => handleChange("endTime", date)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    dateFormat="hh:mm aa"
                    timeCaption="End"
                    className="w-30 bg-input-light  border border-border-light  rounded-lg px-3 py-2 text-text-main  text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
            </div>

            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50  transition-colors"
                    aria-label="Remove time block"
                >
                    <MdClose className="text-lg" />
                </button>
            )}
        </div>
    )

}

export default TimeBlockPicker;