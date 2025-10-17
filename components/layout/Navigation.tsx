'use client';
import { Bell, FileText, Home, Settings, UserCog, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
    const navigation = [
        { name: "Tableau de bord", href: "/dashboard", icon: Home },
        { name: "Clients", href: "/clients", icon: Users },
        { name: "Créances", href: "/receivables", icon: FileText },
        { name: "Profils de relance", href: "/reminder-profiles", icon: UserCog },
        { name: "Notifications", href: "/notifications", icon: Bell },
        { name: "Paramètres", href: "/settings", icon: Settings },
    ];

    const tourDataByHref: Record<string, string> = {
        "/dashboard": "nav-dashboard",
        "/clients": "nav-clients",
        "/receivables": "nav-receivables",
        "/reminder-profiles": "nav-profiles",
        "/settings": "nav-settings",
    };

    return <>{navigation.map((item) => {
        const Icon = item.icon;
        const isActive = usePathname()?.startsWith(item.href);

        return (
            <Link
                key={item.name}
                href={item.href}
                data-tour={tourDataByHref[item.href]}
                className={`flex items-center px-4 py-3 my-2 text-sm font-medium rounded-md transition-all duration-300
                  ${isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                `}
            >
                <Icon className="h-5 w-5 flex-shrink-0 text-inherit" />
                <span className="ml-3 whitespace-nowrap transition-opacity duration-300">
                    {item.name}
                </span>
            </Link>
        );
    })}</>
}