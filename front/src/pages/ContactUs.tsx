import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, ArrowLeft, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { useNavigate } from 'react-router-dom';

export function ContactUs() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                            <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                                Message Sent!
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 tracking-tight">
                                Thank you for reaching out. We'll get back to you within 24 hours.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={() => navigate('/')}
                                className="w-full"
                            >
                                Return to Home
                            </Button>
                            <Button
                                onClick={() => {
                                    setIsSubmitted(false);
                                    setFormData({ name: '', email: '', subject: '', message: '' });
                                }}
                                variant="ghost"
                                className="w-full"
                            >
                                Send Another Message
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-6">
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