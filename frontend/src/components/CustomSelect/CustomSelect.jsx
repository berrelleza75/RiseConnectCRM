import React, { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';

function CustomSelect({ name, value, onChange, options, disabled = false }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const selected = options.find(o => String(o.value) === String(value ?? ''));

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleSelect = (val) => {
        onChange({ target: { name, value: val } });
        setOpen(false);
    };

    const isPlaceholder = value === '' || value === null || value === undefined;

    return (
        <div className={`cs-wrap ${open ? 'cs-open' : ''} ${disabled ? 'cs-disabled' : ''}`} ref={ref}>
            <button
                type="button"
                className="cs-trigger"
                onClick={() => !disabled && setOpen(!open)}
            >
                <span className={isPlaceholder ? 'cs-ph' : 'cs-val'}>
                    {selected ? selected.label : (options[0]?.label || '— Not set —')}
                </span>
                <svg className="cs-arrow" width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
            </button>

            {open && (
                <div className="cs-dropdown">
                    {options.map((opt) => {
                        const isOn = String(opt.value) === String(value ?? '');
                        return (
                            <div
                                key={opt.value}
                                className={`cs-item ${isOn ? 'cs-item-on' : ''} ${opt.value === '' ? 'cs-item-ph' : ''}`}
                                onClick={() => handleSelect(opt.value)}
                            >
                                <span className="cs-item-check">
                                    {isOn && (
                                        <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                        </svg>
                                    )}
                                </span>
                                {opt.label}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default CustomSelect;
