import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, MessageSquare, Send, ArrowLeft, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { useNavigate } from 'react-router-dom';
import { ContactService } from '../services/ContactService';

export function ContactUs() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (!showSuccessPopup) return;
        const timeoutId = window.setTimeout(() => {
            setShowSuccessPopup(false);
        }, 3500);
        return () => window.clearTimeout(timeoutId);
    }, [showSuccessPopup]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setSubmitError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            await ContactService.sendMessage(formData);
            setFormData({ name: '', email: '', subject: '', message: '' });
            setShowSuccessPopup(true);
        } catch (error: unknown) {
            const message =
                typeof error === 'object' &&
                error !== null &&
                'response' in error &&
                typeof (error as { response?: { data?: { error?: unknown } } }).response?.data?.error === 'string'
                    ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
                    : 'Failed to send message. Please try again.';
            setSubmitError(message || 'Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-6">
            <AnimatePresence>
                {showSuccessPopup && (
                    <motion.div
                        initial={{ opacity: 0, y: -12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="fixed right-4 top-4 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-green-200 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-green-800/60 dark:bg-gray-900/95"
                        role="status"
                        aria-live="polite"
                    >
                        <div className="flex items-start gap-3">
                            <CheckCircle size={18} className="mt-0.5 text-green-600 dark:text-green-400" />
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                                    Email sent successfully
                                </p>
                                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 tracking-tight">
                                    Your message has been delivered. You can send another one below.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-4"
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-2"
                    >
                        <ArrowLeft size={16} />
                        <span>Back</span>
                    </Button>
                </motion.div>

                {/* Contact Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center space-y-4"
                >
                    <div className="w-16 h-16 mx-auto bg-blue-600 rounded-2xl flex items-center justify-center">
                        <Mail size={32} className="text-white" />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                            Contact Us
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2 tracking-tight">
                            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                        </p>
                    </div>
                </motion.div>

                {/* Contact Options */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <Card className="p-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4">
                            <Mail size={24} className="text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                            Email Support
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 tracking-tight">
                            Get help with your account or report issues
                        </p>
                    </Card>

                    <Card className="p-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4">
                            <MessageSquare size={24} className="text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                            General Inquiries
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 tracking-tight">
                            Questions about features or partnerships
                        </p>
                    </Card>
                </motion.div>

                {/* Contact Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your full name"
                                    required
                                />

                                <Input
                                    label="Email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your.email@example.com"
                                    required
                                />
                            </div>

                            <Input
                                label="Subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="What is this regarding?"
                                required
                            />

                            <TextArea
                                label="Message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Tell us more about your inquiry..."
                                rows={6}
                                required
                            />

                            <Button
                                type="submit"
                                loading={isSubmitting}
                                disabled={!formData.name || !formData.email || !formData.subject || !formData.message}
                                className="w-full flex items-center justify-center space-x-2"
                            >
                                <Send size={16} />
                                <span>Send Message</span>
                            </Button>
                            {submitError && (
                                <p className="text-sm text-red-600 dark:text-red-400 tracking-tight">{submitError}</p>
                            )}
                        </form>
                    </Card>
                </motion.div>

                {/* Additional Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center"
                >
                    <Card className="p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                            Response Time
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 tracking-tight">
                            We typically respond to all inquiries within 24 hours during business days.
                            For urgent matters, please include "URGENT" in your subject line.
                        </p>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
