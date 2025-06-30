// app/lib/useLocale.js
import { useState, useEffect } from "react";

const SUPPORTED_LOCALES = ["tr", "en"];
const DEFAULT_LOCALE = "tr";

export function useLocale() {
    const [locale, setLocale] = useState(DEFAULT_LOCALE);

    useEffect(() => {
        const stored = localStorage.getItem("locale");
        if (stored && SUPPORTED_LOCALES.includes(stored)) setLocale(stored);
    }, []);

    const changeLocale = (loc) => {
        if (SUPPORTED_LOCALES.includes(loc)) {
            setLocale(loc);
            localStorage.setItem("locale", loc);
        }
    };

    return [locale, changeLocale];
}
