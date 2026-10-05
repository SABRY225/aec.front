import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCountriesForSelect } from '../../../data/countries';

const PhoneCodeSelector = ({ value, onChange, className = '' }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const countries = getCountriesForSelect();
    
    // Filter countries based on search term
    const filteredCountries = countries.filter(country => {
        if (!country) return false;
        const searchLower = searchTerm.toLowerCase();
        return (
            (country.label && country.label.toLowerCase().includes(searchLower)) ||
            (country.phoneCode && country.phoneCode.includes(searchTerm)) ||
            (country.value && country.value.toLowerCase().includes(searchLower))
        );
    });

    // Get selected country
    const selectedCountry = countries.find(c => c.phoneCode === value) || countries.find(c => c.phoneCode === '+20');

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (phoneCode) => {
        onChange(phoneCode);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => {
                    setIsOpen(!isOpen);
                    setTimeout(() => inputRef.current?.focus(), 100);
                }}
                className="inline-flex items-center rounded-s-md border border-e-0 border-gray-300 bg-gray-50 px-3 py-2 text-gray-700 sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[80px] justify-between"
            >
                <span>{selectedCountry?.phoneCode || '+20'}</span>
                <svg
                    className={`ml-2 h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-80 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder={t('phoneCode.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            autoFocus
                        />
                    </div>

                    {/* Countries List */}
                    <div className="max-h-80 overflow-y-auto">
                        {filteredCountries.length > 0 ? (
                            filteredCountries.map((country) => (
                                <button
                                    key={country.value}
                                    type="button"
                                    onClick={() => handleSelect(country.phoneCode)}
                                    className={`w-full px-4 py-2 text-start hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center justify-between ${
                                        value === country.phoneCode ? 'bg-blue-100' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-gray-900">{country.phoneCode}</span>
                                        <span className="text-sm text-gray-700">{country.label}</span>
                                    </div>
                                    {value === country.phoneCode && (
                                        <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                {t('phoneCode.noCountries')}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhoneCodeSelector;

