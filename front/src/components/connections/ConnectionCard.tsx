
import { motion } from 'framer-motion';
import { MapPin, Clock, Tag } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type {Connection} from '../../types';
import { formatTimeAgo } from '../../utils/dateUtils';

interface ConnectionCardProps {
    connection: Connection;
}

export function ConnectionCard({ connection }: ConnectionCardProps) {
    const categoryColors = {
        love: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
        friendship: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    };

    // @ts-ignore
    // @ts-ignore
    return (
        <Card hover className="p-6">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {connection.author.username.charAt(0).toUpperCase()}
              </span>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                                {connection.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                @{connection.author.username}
                            </p>
                        </div>
                    </div>

                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${categoryColors[connection.category]}`}>
            {connection.category}
          </span>
                </div>

                {/* Content */}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed tracking-tight">
                    {connection.description}
                </p>

                {/* Details */}
                <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    {connection.location && (
                        <div className="flex items-center space-x-1">
                            <MapPin size={14} />
                            <span>{connection.location}</span>
                        </div>
                    )}

                    {connection.age && (
                        <div className="flex items-center space-x-1">
                            <span>{connection.age} years old</span>
                        </div>
                    )}

                    <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{formatTimeAgo(connection.timeStamp)}</span>
                    </div>
                </div>

                {/* Interests */}
                {connection.interests.length > 0 && (
                    <div className="flex items-center flex-wrap gap-2">
                        <Tag size={14} className="text-gray-400" />
                        {connection.interests.map((interest, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            >
                {interest}
              </span>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="primary" size="sm">
                            Connect
                        </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="ghost" size="sm">
                            View Profile
                        </Button>
                    </motion.div>
                </div>
            </div>
        </Card>
    );
}