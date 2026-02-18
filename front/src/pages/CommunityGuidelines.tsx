import { motion } from "framer-motion";

export function CommunityGuidelines() {
    return (
        <div className="min-h-screen p-4 md:p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                        Community Guidelines
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400 tracking-tight">
                        Keep discussions respectful, safe, and constructive.
                    </p>
                </motion.div>

                <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 md:p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Core Rules</h2>
                    <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-2 tracking-tight">
                        <li>No harassment, hate speech, threats, or targeted abuse.</li>
                        <li>No doxxing or sharing private personal information.</li>
                        <li>No illegal content or content promoting violence.</li>
                        <li>No spam, scams, impersonation, or deceptive behavior.</li>
                        <li>Respect moderation decisions and platform policies.</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}

