import React, { useState, useRef, useEffect } from 'react';
import { formatDate, formatDateForInput, parseDate } from '../../../utils/dateUtils';
import './DatePicker.css';

export const DatePicker = ({
    label,
    name,
    value,
    onChange,
    error,
    required = false,
    placeholder = 'DD-MMM-YYYY',
    disabled = false,
    className = '',
    helperText = '',
    minDate,
    maxDate
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [displayMonth, setDisplayMonth] = useState(new Date());
    const [inputValue, setInputValue] = useState('');
    const datePickerRef = useRef(null);
    const inputRef = useRef(null);

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    // Update input value when value prop changes
    useEffect(() => {
        if (value) {
            setInputValue(formatDate(value));
            setDisplayMonth(new Date(value));
        } else {
            setInputValue('');
        }
    }, [value]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Generate days for calendar
    const generateCalendarDays = () => {
        const year = displayMonth.getFullYear();
        const month = displayMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        let startDay = new Date(firstDay);
        const dayOfWeek = firstDay.getDay() || 7;
        startDay.setDate(startDay.getDate() - (dayOfWeek - 1));

        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDay);
            currentDate.setDate(startDay.getDate() + i);

            const isCurrentMonth = currentDate.getMonth() === month;
            const isToday = currentDate.getTime() === today.getTime();
            const isSelected = value && new Date(value).toDateString() === currentDate.toDateString();

            // Check min/max date
            let isDisabled = false;
            if (minDate && currentDate < new Date(minDate)) isDisabled = true;
            if (maxDate && currentDate > new Date(maxDate)) isDisabled = true;

            days.push({
                date: currentDate,
                day: currentDate.getDate(),
                isCurrentMonth,
                isToday,
                isSelected,
                isDisabled
            });
        }

        return days;
    };

    const handleDateSelect = (date) => {
        if (!date.isDisabled && date.isCurrentMonth) {
            const formattedDate = formatDateForInput(date.date);
            if (onChange) {
                onChange({
                    target: { name, value: formattedDate }
                });
            }
            setIsOpen(false);
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);

        // Try to parse the date
        const parsed = parseDate(val);
        if (parsed && !isNaN(parsed.getTime())) {
            if (onChange) {
                onChange({
                    target: { name, value: formatDateForInput(parsed) }
                });
            }
            setDisplayMonth(parsed);
        }
    };

    const handleInputBlur = () => {
        if (inputValue) {
            const parsed = parseDate(inputValue);
            if (!parsed || isNaN(parsed.getTime())) {
                setInputValue(value ? formatDate(value) : '');
            } else {
                setInputValue(formatDate(parsed));
            }
        }
    };

    const changeMonth = (delta) => {
        setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + delta, 1));
    };

    const changeYear = (delta) => {
        setDisplayMonth(new Date(displayMonth.getFullYear() + delta, displayMonth.getMonth(), 1));
    };

    const weeks = [];
    const calendarDays = generateCalendarDays();
    for (let i = 0; i < calendarDays.length; i += 7) {
        weeks.push(calendarDays.slice(i, i + 7));
    }

    return (
        <div className={`datepicker-wrapper ${className}`} ref={datePickerRef}>
            {label && (
                <label className="datepicker-label" htmlFor={name}>
                    {label}
                    {required && <span className="required-star">*</span>}
                </label>
            )}

            <div className={`datepicker-container ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''}`}>
                <input
                    ref={inputRef}
                    type="text"
                    name={name}
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onFocus={() => !disabled && setIsOpen(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="datepicker-input"
                    autoComplete="off"
                />

                <button
                    type="button"
                    className="datepicker-trigger"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                >
                    📅
                </button>

                {isOpen && !disabled && (
                    <div className="datepicker-dropdown">
                        <div className="datepicker-header">
                            <button type="button" onClick={() => changeYear(-1)}>«</button>
                            <button type="button" onClick={() => changeMonth(-1)}>‹</button>
                            <span className="datepicker-month-year">
                                {MONTHS[displayMonth.getMonth()]} {displayMonth.getFullYear()}
                            </span>
                            <button type="button" onClick={() => changeMonth(1)}>›</button>
                            <button type="button" onClick={() => changeYear(1)}>»</button>
                        </div>

                        <div className="datepicker-weekdays">
                            {DAYS.map(day => (
                                <div key={day} className="weekday">{day}</div>
                            ))}
                        </div>

                        <div className="datepicker-days">
                            {weeks.map((week, weekIdx) => (
                                <div key={weekIdx} className="week">
                                    {week.map((day, dayIdx) => (
                                        <button
                                            key={dayIdx}
                                            type="button"
                                            className={`day 
                                                ${!day.isCurrentMonth ? 'other-month' : ''} 
                                                ${day.isToday ? 'today' : ''} 
                                                ${day.isSelected ? 'selected' : ''}
                                                ${day.isDisabled ? 'disabled' : ''}
                                            `}
                                            onClick={() => handleDateSelect(day)}
                                            disabled={day.isDisabled}
                                        >
                                            {day.day}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div className="datepicker-footer">
                            <button
                                type="button"
                                className="today-btn"
                                onClick={() => {
                                    const today = new Date();
                                    if (onChange) {
                                        onChange({
                                            target: { name, value: formatDateForInput(today) }
                                        });
                                    }
                                    setIsOpen(false);
                                }}
                            >
                                Today
                            </button>
                            <button
                                type="button"
                                className="clear-btn"
                                onClick={() => {
                                    if (onChange) {
                                        onChange({
                                            target: { name, value: '' }
                                        });
                                    }
                                    setInputValue('');
                                    setIsOpen(false);
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {(error || helperText) && (
                <div className={`datepicker-message ${error ? 'error' : 'helper'}`}>
                    {error || helperText}
                </div>
            )}
        </div>
    );
};

export default DatePicker;