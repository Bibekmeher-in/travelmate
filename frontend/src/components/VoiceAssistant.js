import React, { useState, useEffect, useRef } from 'react';
import { FiMic, FiMicOff, FiX, FiMessageCircle } from 'react-icons/fi';

const VoiceAssistant = ({ onCommand }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);
    const [showPanel, setShowPanel] = useState(false);
    const [lastResponse, setLastResponse] = useState(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Check for Web Speech API support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError('Speech recognition is not supported in your browser');
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
            const current = event.resultIndex;
            const result = event.results[current];
            const transcriptText = result[0].transcript;

            setTranscript(transcriptText);

            if (result.isFinal) {
                processCommand(transcriptText);
            }
        };

        recognitionRef.current.onerror = (event) => {
            setError(`Speech recognition error: ${event.error}`);
            setIsListening(false);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            setError(null);
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (err) {
                setError('Failed to start listening');
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const processCommand = async (command) => {
        const lowerCommand = command.toLowerCase();

        // Process commands
        let action = null;
        let params = {};

        if (lowerCommand.includes('nearby hotels') || lowerCommand.includes('show hotels')) {
            action = 'hotels';
        } else if (lowerCommand.includes('find restaurants') || lowerCommand.includes('show restaurants')) {
            action = 'restaurants';
        } else if (lowerCommand.includes('temples') || lowerCommand.includes('show temples')) {
            action = 'temples';
        } else if (lowerCommand.includes('plan my trip') || lowerCommand.includes('plan trip')) {
            action = 'tripPlanner';
        } else if (lowerCommand.includes('emergency') || lowerCommand.includes('hospital')) {
            action = 'emergency';
        } else if (lowerCommand.includes('nearby places') || lowerCommand.includes('what\'s nearby')) {
            action = 'nearby';
        } else {
            // Use AI chat for other commands
            if (onCommand) {
                try {
                    const response = await onCommand(command);
                    setLastResponse(response);
                } catch (err) {
                    setError('Failed to process command');
                }
            }
            return;
        }

        if (onCommand) {
            onCommand({ action, params, rawCommand: command });
        }
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const quickCommands = [
        { label: 'Show Hotels', command: 'Show nearby hotels' },
        { label: 'Find Restaurants', command: 'Find restaurants' },
        { label: 'Show Temples', command: 'Show temples' },
        { label: 'Plan My Trip', command: 'Plan my trip' },
        { label: 'Emergency', command: 'Show hospitals' },
        { label: 'Explore Nearby', command: 'What\'s nearby' },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Voice Button */}
            <button
                onClick={() => setShowPanel(!showPanel)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${isListening
                        ? 'bg-red-500 animate-pulse'
                        : 'bg-primary-500 hover:bg-primary-600'
                    }`}
            >
                {showPanel ? (
                    <FiX className="w-6 h-6 text-white" />
                ) : isListening ? (
                    <FiMic className="w-6 h-6 text-white" />
                ) : (
                    <FiMessageCircle className="w-6 h-6 text-white" />
                )}
            </button>

            {/* Voice Panel */}
            {showPanel && (
                <div className="absolute bottom-16 right-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden animate-slide-up">
                    {/* Header */}
                    <div className="gradient-bg p-4">
                        <h3 className="text-white font-semibold flex items-center space-x-2">
                            <FiMic className="w-5 h-5" />
                            <span>Voice Assistant</span>
                        </h3>
                    </div>

                    {/* Listening Status */}
                    <div className="p-4">
                        <div className="flex items-center justify-center mb-4">
                            <button
                                onClick={toggleListening}
                                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isListening
                                        ? 'bg-red-500 voice-pulse'
                                        : 'bg-primary-500 hover:bg-primary-600'
                                    }`}
                            >
                                {isListening ? (
                                    <FiMicOff className="w-8 h-8 text-white" />
                                ) : (
                                    <FiMic className="w-8 h-8 text-white" />
                                )}
                            </button>
                        </div>

                        {/* Transcript */}
                        {transcript && (
                            <div className="text-center mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">You said:</p>
                                <p className="font-medium text-gray-800 dark:text-white">{transcript}</p>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="text-center mb-4 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Last Response */}
                        {lastResponse && (
                            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm text-gray-700 dark:text-gray-300">{lastResponse}</p>
                            </div>
                        )}

                        {/* Quick Commands */}
                        <div className="space-y-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Quick Commands:</p>
                            <div className="flex flex-wrap gap-2">
                                {quickCommands.map((cmd, index) => (
                                    <button
                                        key={index}
                                        onClick={() => processCommand(cmd.command)}
                                        className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
                                    >
                                        {cmd.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Help Text */}
                    <div className="px-4 pb-4">
                        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                            Try: "Show nearby hotels", "Find restaurants", "Plan my trip"
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceAssistant;