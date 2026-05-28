import { motion } from 'framer-motion';
import { CheckCircle2, Clock, MapPin, Tag } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type {Connection} from '../../types';
import { formatTimeAgo } from '../../utils/dateUtils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { ConnectionService } from '../../services/ConnectionService';

interface ConnectionCardProps {
    connection: Connection;
    onStatusChange?: () => Promise<void>;
}

export function ConnectionCard({ connection, onStatusChange }: ConnectionCardProps) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectMessage, setConnectMessage] = useState('');
    const [localStatus, setLocalStatus] = useState<Connection["requestStatus"] | undefined>(connection.requestStatus);

    const categoryColors = {
        love: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
        friendship: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    };

    const status = localStatus || connection.requestStatus || "none";
    const isOwnConnection = status === "own" || (!!user && user.id === connection.author.id);
    const isPending = status === "pending";
    const isAccepted = status === "accepted";

    const handleConnect = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (isOwnConnection) {
            setConnectMessage('You cannot connect to your own post.');
            return;
        }
        if (isPending || isAccepted) return;

        setIsConnecting(true);
        setConnectMessage('');
        try {
            const result = await ConnectionService.connect(connection.id);
            setLocalStatus(result.status === "accepted" ? "accepted" : "pending");
            setConnectMessage(result.message);
            await onStatusChange?.();
        } catch (error: unknown) {
            const message = (
                typeof error === 'object' &&
                error !== null &&
                'response' in error &&
                typeof (error as { response?: { data?: { error?: unknown } } }).response?.data?.error === 'string'
                    ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
                    : 'Could not send connection request.'
            ) || 'Could not send connection request.';
            setConnectMessage(message);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <Card hover className="p-4 sm:p-5 lg:p-6 h-full">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {connection.author.username.charAt(0).toUpperCase()}
              </span>
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight break-words">
                                {connection.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                @{connection.author.username}
                            </p>
                        </div>
                    </div>

                    <span className={`shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${categoryColors[connection.category]}`}>
            {connection.category}
          </span>
                </div>

                {/* Content */}
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed tracking-tight break-words">
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
                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="primary"
                            size="sm"
                            className="w-full sm:w-auto"
                            loading={isConnecting}
                            disabled={isPending || isAccepted || isOwnConnection}
                            onClick={() => void handleConnect()}
                        >
                            {isOwnConnection ? 'Your Post' : isAccepted ? 'Connected' : isPending ? 'Requested' : 'Connect'}
                        </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button className="w-full sm:w-auto" variant="ghost" size="sm" onClick={() => navigate(`/connections/${connection.id}/profile`)}>
                            View Profile
                        </Button>
                    </motion.div>
                </div>
                    {isAccepted && (
                        <div className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-300">
                            <CheckCircle2 size={14} />
                            Connected
                        </div>
                    )}
                    {connectMessage && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 tracking-tight">
                            {connectMessage}
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );
}
