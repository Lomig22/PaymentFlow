'use client';
import { AbonnementProvider } from '../../../components/context/AbonnementContext';

export default function ClientsLayout({ children }: { children: React.ReactNode }) {
    return <AbonnementProvider>{children}</AbonnementProvider>;
}
