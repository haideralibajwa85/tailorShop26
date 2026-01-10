'use client';

import { useEffect, useState } from 'react';

export default function CheckEnvPage() {
    const [env, setEnv] = useState<{ url: boolean; key: boolean }>({ url: false, key: false });

    useEffect(() => {
        setEnv({
            url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        });
    }, []);

    return (
        <div className="p-10 font-sans">
            <h1 className="text-2xl font-bold mb-4">Supabase Connection Debug</h1>
            <div className="space-y-2">
                <p>
                    <strong>URL Configured:</strong> {env.url ? '✅ YES' : '❌ NO'}
                </p>
                <p>
                    <strong>Key Configured:</strong> {env.key ? '✅ YES' : '❌ NO'}
                </p>
            </div>
            {!env.url || !env.key ? (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    <p className="font-bold">Keys are missing!</p>
                    <p>Please add them to your Vercel Project Settings &gt; Environment Variables and then <strong>Redeploy</strong>.</p>
                </div>
            ) : (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                    <p className="font-bold">Success!</p>
                    <p>Your environment variables are correctly loaded.</p>
                </div>
            )}
        </div>
    );
}
