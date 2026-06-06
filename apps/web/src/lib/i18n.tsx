import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.chats': 'Chats',
        'nav.knowledge': 'Knowledge',
        'nav.sources': 'Sources',
        'nav.prompts': 'Prompts',
        'nav.settings': 'Settings',
        'nav.help': 'Help',
        'nav.logout': 'Log out',
        'nav.system_online': 'System Online',

        // Command Palette
        'cmd.search': 'Search commands, pages, or tools...',
        'cmd.no_results': 'No results found.',
        'cmd.nav_dashboard': 'Go to Dashboard',
        'cmd.nav_chat': 'New Chat',
        'cmd.nav_documents': 'Upload Knowledge',
        'cmd.nav_prompts': 'View Prompt Library',
        'cmd.nav_settings': 'View Settings',
        'cmd.toggle_demo': 'Toggle Demo Mode',
        'cmd.logout': 'Log Out',
        'cmd.to_navigate': 'to navigate',
        'cmd.to_select': 'to select',

        // Login
        'login.title': 'Atlas Copilot',
        'login.subtitle': 'Sign in to your intelligent workspace.',
        'login.email': 'Email Address',
        'login.password': 'Password',
        'login.forgot': 'Forgot password?',
        'login.button': 'Sign In',
        'login.button_loading': 'Authenticating...',
        'login.guest_access': 'Guest Access',
        'login.demo': 'Try Live Demo',
        'login.terms': 'By accessing Atlas, you agree to our Terms of Service and Privacy Policy. Internal corporate use only.',

        // Dashboard
        'dash.hero_title_1': 'Intelligent',
        'dash.hero_title_2': 'Logistics',
        'dash.hero_title_3': 'Workspace',
        'dash.hero_desc': 'Centralize your supply chain data. Query live SLA policies, tariff indexes, and customs guidelines natively via semantic search.',
        'dash.stats_queries': 'Total queries',
        'dash.stats_docs': 'Active documents',
        'dash.stats_savings': 'Hours saved',
        'dash.quick_ask': 'Ask a question',
        'dash.quick_ask_desc': 'Query your knowledge base in plain language.',
        'dash.quick_upload': 'Add documents',
        'dash.quick_upload_desc': 'Index new files so Atlas can cite them.',
        'dash.capabilities': 'How Atlas works',
        'dash.feature_1_title': 'Deep Knowledge Graph',
        'dash.feature_1_desc': 'Multi-tenant RAG pipeline fetching exact policies across unstructured shipping manuals instantaneously.',
        'dash.feature_2_title': 'Sovereign Control',
        'dash.feature_2_desc': 'Data isolated by company ID. Auditable responses with direct source citation and exact document page numbers.',
        'dash.feature_3_title': 'Actionable Prompting',
        'dash.feature_3_desc': 'Templatized extraction rules for Bill of Lading reviews, DG Compliance, and hidden surcharge audits.',
    },
    es: {
        // Navigation
        'nav.dashboard': 'Panel',
        'nav.chats': 'Chats',
        'nav.knowledge': 'Conocimiento',
        'nav.sources': 'Integraciones',
        'nav.prompts': 'Plantillas',
        'nav.settings': 'Ajustes',
        'nav.help': 'Ayuda',
        'nav.logout': 'Cerrar sesión',
        'nav.system_online': 'Sistema en línea',

        // Command Palette
        'cmd.search': 'Buscar comandos, páginas o herramientas...',
        'cmd.no_results': 'No se encontraron resultados.',
        'cmd.nav_dashboard': 'Ir al Panel',
        'cmd.nav_chat': 'Nuevo Chat',
        'cmd.nav_documents': 'Subir Conocimiento',
        'cmd.nav_prompts': 'Ver Biblioteca de Prompts',
        'cmd.nav_settings': 'Ver Ajustes',
        'cmd.toggle_demo': 'Activar Modo Demo',
        'cmd.logout': 'Cerrar sesión',
        'cmd.to_navigate': 'navegar',
        'cmd.to_select': 'seleccionar',

        // Login
        'login.title': 'Atlas Copilot',
        'login.subtitle': 'Inicia sesión en tu entorno inteligente.',
        'login.email': 'Correo electrónico',
        'login.password': 'Contraseña',
        'login.forgot': '¿Olvidaste tu contraseña?',
        'login.button': 'Iniciar Sesión',
        'login.button_loading': 'Autenticando...',
        'login.guest_access': 'Acceso de Invitado',
        'login.demo': 'Probar Demostración',
        'login.terms': 'Al acceder a Atlas, aceptas los Términos de Servicio y la Política de Privacidad. Uso corporativo interno.',

        // Dashboard
        'dash.hero_title_1': 'Entorno de',
        'dash.hero_title_2': 'Logística',
        'dash.hero_title_3': 'Inteligente',
        'dash.hero_desc': 'Centraliza los datos de tu cadena de suministro. Consulta políticas en vivo, manuales y aduanas nativamente vía búsqueda semántica.',
        'dash.stats_queries': 'Consultas totales',
        'dash.stats_docs': 'Documentos activos',
        'dash.stats_savings': 'Horas ahorradas',
        'dash.quick_ask': 'Hacer una pregunta',
        'dash.quick_ask_desc': 'Consulta tu base de conocimiento en lenguaje natural.',
        'dash.quick_upload': 'Agregar documentos',
        'dash.quick_upload_desc': 'Indexa archivos nuevos para que Atlas pueda citarlos.',
        'dash.capabilities': 'Cómo funciona Atlas',
        'dash.feature_1_title': 'Graph de Conocimiento',
        'dash.feature_1_desc': 'Busca políticas exactas a lo largo de manuales logísticos no estructurados casi instantáneamente.',
        'dash.feature_2_title': 'Control Soberano',
        'dash.feature_2_desc': 'Datos aislados por empresa. Respuestas auditables con citas directas a las fuentes de los documentos.',
        'dash.feature_3_title': 'Prompts Accionables',
        'dash.feature_3_desc': 'Reglas de extracción para revisión de Bill of Ladings, cumplimiento DG y auditorías de recargos ocultos.',
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Language>('es');

    useEffect(() => {
        const stored = localStorage.getItem('app-lang') as Language;
        if (stored === 'en' || stored === 'es') {
            setLangState(stored);
        } else {
            // Default to Spanish; only switch to English for explicitly English browsers
            const browserLang = navigator.language.startsWith('en') ? 'en' : 'es';
            setLangState(browserLang);
        }
    }, []);

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        localStorage.setItem('app-lang', newLang);
    };

    const t = (key: string): string => {
        return translations[lang][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
