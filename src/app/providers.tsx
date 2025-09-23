"use client";
import i18n from "@/locale/i18n";
import { store } from "@/store/store";
import React, { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { Provider } from "react-redux";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <I18nextProvider i18n={i18n}>
                <I18n>{children}</I18n>
            </I18nextProvider>
        </Provider>
    );
}

const I18n = ({ children }: { children: React.ReactNode }) => {
    const [active, setActive] = useState(false);
    useEffect(() => {
        const lang = localStorage.getItem("language");
        if (lang) {
            i18n.changeLanguage(lang);
        } else {
            i18n.changeLanguage("fr");
        }
        setActive(true);
    }, []);
    return <>{active && children}</>;
};
