import { motion } from "framer-motion";

export function PrivacyPolicy() {
    return (
        <div className="min-h-screen p-4 md:p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                        Privacy Policy
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400 tracking-tight">
                        How we handle, store, and protect your data.
                    </p>
                </motion.div>

                <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 md:p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Data Practices</h2>
                    <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-2 tracking-tight">
                        <li>We store only data required to run platform features.</li>
                        <li>Authentication tokens and settings are protected by backend controls.</li>
                        <li>We do not sell personal data to third parties.</li>
                        <li>You can request account deletion and data export through support.</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}

